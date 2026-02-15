import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Search, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  hotline?: string;
  isActive: boolean;
  order: number;
  _count?: { products: number };
}

export const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    website: '',
    hotline: '',
    order: 0
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/brands');
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      toast.error('Không thể tải danh sách brands');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBrand
        ? `http://localhost:3001/api/brands/${editingBrand.id}`
        : 'http://localhost:3001/api/brands';

      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save brand');

      toast.success(editingBrand ? 'Cập nhật brand thành công!' : 'Tạo brand thành công!');
      setIsModalOpen(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa brand này?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/brands/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete brand');

      toast.success('Xóa brand thành công!');
      fetchBrands();
    } catch (error) {
      toast.error('Không thể xóa brand. Brand có thể đang được sử dụng.');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      website: brand.website || '',
      hotline: brand.hotline || '',
      order: brand.order
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      website: '',
      hotline: '',
      order: 0
    });
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-white text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lý Thương Hiệu</h2>
          <p className="text-zinc-400 mt-1">Quản lý các thương hiệu guitar</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Brand
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm brand..."
          className="pl-10 bg-zinc-900 border-zinc-800 text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Tổng Brands</p>
              <p className="text-2xl font-bold text-white mt-1">{brands.length}</p>
            </div>
            <Package className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Brands Hoạt Động</p>
              <p className="text-2xl font-bold text-white mt-1">
                {brands.filter(b => b.isActive).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Tổng Sản Phẩm</p>
              <p className="text-2xl font-bold text-white mt-1">
                {brands.reduce((sum, b) => sum + (b._count?.products || 0), 0)}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => (
          <motion.div
            key={brand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <Package className="w-6 h-6 text-zinc-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-white font-semibold">{brand.name}</h3>
                  <p className="text-zinc-400 text-sm">{brand._count?.products || 0} sản phẩm</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {brand.description && (
              <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{brand.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {brand.website && (
                <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline block">
                  {brand.website}
                </a>
              )}
              {brand.hotline && (
                <p className="text-zinc-400">Hotline: {brand.hotline}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                brand.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
              }`}>
                {brand.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">Không tìm thấy brand nào</p>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-white">
                {editingBrand ? 'Sửa Brand' : 'Thêm Brand Mới'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Tên Brand *
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Yamaha, Fender, Gibson..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Slug *
                  </label>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="yamaha, fender, gibson..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Logo URL
                </label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  placeholder="Mô tả về brand..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://yamaha.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Hotline
                  </label>
                  <Input
                    value={formData.hotline}
                    onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="1900-xxxx"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                >
                  {editingBrand ? 'Cập Nhật' : 'Tạo Brand'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
