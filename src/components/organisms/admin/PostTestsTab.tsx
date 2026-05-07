import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { postTestsApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const emptyForm = { title: '', content: '' };

export const PostTestsTab: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const data = await postTestsApi.getAll({ limit: 100 });
      setPosts(data.posts || []);
    } catch { toast.error('Không thể tải danh sách bài viết'); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (post?: any) => {
    if (post) {
      setEditing(post);
      setForm({
        title: post.title || '',
        content: post.content || '',
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!form.content.trim()) { toast.error('Vui lòng nhập nội dung'); return; }
    try {
      if (editing) {
        await postTestsApi.update(editing.id, form);
        toast.success('Đã cập nhật bài viết');
      } else {
        await postTestsApi.create(form);
        toast.success('Đã thêm bài viết');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu bài viết'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Xóa bài viết "${title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await postTestsApi.delete(id);
      toast.success('Đã xóa bài viết');
      load();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa bài viết'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Post Test</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
          <Plus className="w-5 h-5" />
          Thêm bài viết
        </motion.button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có bài viết nào. Nhấn "Thêm bài viết" để bắt đầu.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-start gap-4 p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white truncate">{post.title}</h3>
                  </div>
                  <p className="text-white/60 text-sm mb-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-white/40 text-xs">
                    <span>Tạo: {formatDate(post.createdAt)}</span>
                    <span>Cập nhật: {formatDate(post.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(post)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(post.id, post.title)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Tiêu đề *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="Nhập tiêu đề bài viết..." />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Nội dung *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Nội dung bài viết..." />
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
