import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Star, Package, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, categoriesApi, brandsApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';
import { ImageUploadField } from '@/components/molecules/ImageUploadField';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const emptyForm = {
  name: '',
  price: '',
  oldPrice: '',
  discount: '',
  image: '',
  categoryId: '',
  brandId: '',
  description: '',
  stock: '0',
  isFeatured: false,
  isActive: true,
};

export const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brRes] = await Promise.all([
        productsApi.getAll({ limit: 100 }),
        categoriesApi.getAll(),
        brandsApi.getAll(),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
      setBrands(brRes.data?.brands || (brRes as any).brands || []);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name || '',
        price: String(Number(product.price) || ''),
        oldPrice: product.oldPrice ? String(Number(product.oldPrice)) : '',
        discount: product.discount != null ? String(product.discount) : '',
        image: product.image || '',
        categoryId: product.categoryId || product.category?.id || '',
        brandId: product.brandId || product.brand?.id || '',
        description: product.description || '',
        stock: String(product.stock ?? 0),
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error('Vui lòng nhập giá hợp lệ'); return; }
    if (!form.image.trim()) { toast.error('Vui lòng tải ảnh sản phẩm'); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        discount: form.discount ? Number(form.discount) : null,
        image: form.image,
        categoryId: form.categoryId || undefined,
        brandId: form.brandId || undefined,
        description: form.description.trim(),
        stock: Number(form.stock) || 0,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (editing) {
        await productsApi.update(editing.id, payload);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await productsApi.create(payload);
        toast.success('Đã thêm sản phẩm mới');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await productsApi.delete(id);
      toast.success('Đã xóa sản phẩm');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Không thể xóa sản phẩm');
    }
  };

  const getCategoryName = (product: any) => {
    if (typeof product.category === 'object' && product.category) return product.category.name;
    return '—';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý sản phẩm</h2>
          <p className="text-white/50 text-sm mt-1">{products.length} sản phẩm</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm
          </motion.button>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-white/80 font-medium">Sản phẩm</th>
                  <th className="px-6 py-4 text-left text-white/80 font-medium">Danh mục</th>
                  <th className="px-6 py-4 text-left text-white/80 font-medium">Giá</th>
                  <th className="px-6 py-4 text-center text-white/80 font-medium">Kho</th>
                  <th className="px-6 py-4 text-center text-white/80 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 text-right text-white/80 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-zinc-800" />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.isFeatured && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded font-medium">Nổi bật</span>
                            )}
                            {product.discount > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-medium">-{product.discount}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">{getCategoryName(product)}</td>
                    <td className="px-6 py-4">
                      <p className="text-amber-500 font-medium">{formatPrice(Number(product.price))}</p>
                      {product.oldPrice && (
                        <p className="text-white/30 text-xs line-through">{formatPrice(Number(product.oldPrice))}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-medium ${product.stock <= (product.lowStockAlert || 5) ? 'text-red-400' : 'text-white/70'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                        {product.isActive ? 'Hiển thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(product.id, product.name)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'} maxWidth="max-w-2xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Image */}
          <ImageUploadField value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} label="Ảnh sản phẩm *" folder="guitar-nova/products" />

          {/* Name */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Tên sản phẩm *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="VD: Yamaha FG800 Acoustic Guitar" />
          </div>

          {/* Category & Brand Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Danh mục</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                <option value="">— Chọn danh mục —</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Thương hiệu</label>
              <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50">
                <option value="">— Chọn thương hiệu —</option>
                {brands.map((br: any) => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Giá bán (VNĐ) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="5000000" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Giá gốc (VNĐ)</label>
              <input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="6000000" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Giảm giá (%)</label>
              <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="10" min="0" max="100" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Số lượng trong kho</label>
            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="50" min="0" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm mb-2">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Mô tả chi tiết sản phẩm..." />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.isFeatured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-white/50 border border-white/10'}`}
            >
              <Star className={`w-4 h-4 ${form.isFeatured ? 'fill-amber-400' : ''}`} />
              Nổi bật
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-zinc-800 text-white/50 border border-white/10'}`}
            >
              {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.isActive ? 'Hiển thị' : 'Ẩn'}
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
