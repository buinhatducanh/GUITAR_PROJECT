import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Award, Package, FileText, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { brandsApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';

export const BrandsTab: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', logo: '', description: '', website: '', hotline: '' });

  const load = async () => {
    try {
      const data = await brandsApi.getAll();
      setBrands(data.brands || []);
    } catch { toast.error('Không thể tải danh sách thương hiệu'); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (brand?: any) => {
    if (brand) {
      setEditing(brand);
      setForm({ name: brand.name, slug: brand.slug, logo: brand.logo || '', description: brand.description || '', website: brand.website || '', hotline: brand.hotline || '' });
    } else {
      setEditing(null);
      setForm({ name: '', slug: '', logo: '', description: '', website: '', hotline: '' });
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm(f => ({ ...f, name, slug: f.slug === '' || f.slug === (f.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) ? slug : f.slug }));
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await brandsApi.update(editing.id, form);
        toast.success('Đã cập nhật thương hiệu');
      } else {
        await brandsApi.create(form);
        toast.success('Đã thêm thương hiệu');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu thương hiệu'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await brandsApi.delete(id);
      toast.success('Đã xóa thương hiệu');
      load();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa thương hiệu đang có sản phẩm'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Thương Hiệu</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all">
          <Plus className="w-5 h-5" />
          Thêm thương hiệu
        </motion.button>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có thương hiệu nào. Nhấn "Thêm thương hiệu" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain bg-white rounded-lg p-1" />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white">{brand.name}</h3>
                      <p className="text-white/40 text-xs">@{brand.slug}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${brand.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                    {brand.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                <p className="text-white/60 text-sm mb-4 flex-grow">{brand.description || '—'}</p>
                <div className="space-y-2 mb-4">
                  {brand.website && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <FileText className="w-3 h-3" />
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors truncate">{brand.website}</a>
                    </div>
                  )}
                  {brand.hotline && (
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{brand.hotline}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span className="text-white font-semibold">{brand._count?.products ?? 0} sản phẩm</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(brand)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(brand.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Tên thương hiệu *', type: 'text', onChange: (v: string) => handleNameChange(v) },
            { key: 'slug', label: 'Slug *', type: 'text' },
            { key: 'logo', label: 'Logo URL', type: 'url' },
            { key: 'website', label: 'Website', type: 'url' },
            { key: 'hotline', label: 'Hotline', type: 'text' },
          ].map(({ key, label, type, onChange }) => (
            <div key={key}>
              <label className="block text-white/80 text-sm mb-2">{label}</label>
              <input type={type} value={(form as any)[key]} onChange={e => onChange ? onChange(e.target.value) : setForm(f => ({ ...f, [key]: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50" />
            </div>
          ))}
          <div>
            <label className="block text-white/80 text-sm mb-2">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 resize-none" />
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl transition-all">Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
