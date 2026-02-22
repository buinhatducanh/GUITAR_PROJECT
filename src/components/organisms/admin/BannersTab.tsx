import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { bannersApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';
import { ImageUploadField } from '@/components/molecules/ImageUploadField';

const emptyForm = { image: '', title: '', subtitle: '', link: '', order: '0', isActive: true };

export const BannersTab: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const data = await bannersApi.getAllAdmin();
      setBanners(data || []);
    } catch { toast.error('Không thể tải danh sách banner'); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (banner?: any) => {
    if (banner) {
      setEditing(banner);
      setForm({
        image: banner.image || '',
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        link: banner.link || '',
        order: String(banner.order ?? 0),
        isActive: banner.isActive ?? true,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!form.image.trim()) { toast.error('Vui lòng tải lên ảnh banner'); return; }
    try {
      const payload = {
        ...form,
        order: parseInt(form.order) || 0,
      };
      if (editing) {
        await bannersApi.update(editing.id, payload);
        toast.success('Đã cập nhật banner');
      } else {
        await bannersApi.create(payload);
        toast.success('Đã thêm banner');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu banner'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Xóa banner "${title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await bannersApi.delete(id);
      toast.success('Đã xóa banner');
      load();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa banner'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Banner</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
          <Plus className="w-5 h-5" />
          Thêm banner
        </motion.button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có banner nào. Nhấn "Thêm banner" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
              <div className="relative h-48">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                    {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                    #{banner.order}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold mb-1">{banner.title}</h3>
                  <p className="text-white/60 text-sm">{banner.subtitle}</p>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-white/40 text-xs truncate">{banner.link}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(banner)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(banner.id, banner.title)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa banner' : 'Thêm banner mới'} maxWidth="max-w-lg">
        <div className="space-y-4">
          <ImageUploadField value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} label="Ảnh banner" folder="guitar-nova/banners" />
          <div>
            <label className="block text-white/80 text-sm mb-2">Tiêu đề *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="Tiêu đề banner..." />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Phụ đề</label>
            <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="Mô tả ngắn..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Link điều hướng</label>
              <input type="text" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="/products" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Thứ tự</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="0" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.isActive ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}
            >
              {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.isActive ? 'Hiển thị' : 'Ẩn'}
            </button>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all">Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
