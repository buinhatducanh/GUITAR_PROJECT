import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { blogsApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

const emptyForm = { title: '', slug: '', excerpt: '', content: '', coverImage: '', authorName: '', authorAvatar: '', category: '', tags: '', readTime: '', isPublished: true };

export const BlogPostsTab: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const data = await blogsApi.getAll({ limit: 100 });
      setPosts(data.posts || []);
    } catch { toast.error('Không thể tải danh sách bài viết'); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (post?: any) => {
    if (post) {
      setEditing(post);
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.coverImage || '',
        authorName: post.authorName || '',
        authorAvatar: post.authorAvatar || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        readTime: String(post.readTime || ''),
        isPublished: post.isPublished ?? true,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleTitleChange = (title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm(f => ({
      ...f,
      title,
      slug: f.slug === '' || f.slug === (f.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) ? slug : f.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: parseInt(form.readTime) || 5,
      };
      if (editing) {
        await blogsApi.update(editing.id, payload);
        toast.success('Đã cập nhật bài viết');
      } else {
        await blogsApi.create(payload);
        toast.success('Đã thêm bài viết');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu bài viết'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await blogsApi.delete(id);
      toast.success('Đã xóa bài viết');
      load();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa bài viết'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Blog Posts</h2>
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
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title} className="w-32 h-20 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white truncate">{post.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${post.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {post.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mb-2 line-clamp-1">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-white/40 text-xs">
                    <span>Tác giả: {post.authorName}</span>
                    <span>Danh mục: {post.category}</span>
                    <span>{post.readTime} phút đọc</span>
                    <span>{post.views?.toLocaleString('vi-VN') || 0} lượt xem</span>
                    {post.publishedDate && <span>{formatDate(post.publishedDate)}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(post)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(post.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
            <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="Nhập tiêu đề bài viết..." />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Slug</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Tóm tắt</label>
            <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Mô tả ngắn cho bài viết..." />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Nội dung</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none" placeholder="Nội dung bài viết..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Ảnh bìa (URL)</label>
              <input type="url" value={form.coverImage} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Danh mục</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="VD: Hướng dẫn" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Tác giả</label>
              <input type="text" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Thời gian đọc (phút)</label>
              <input type="number" value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="5" />
            </div>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Tags (phân cách bằng dấu phẩy)</label>
            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50" placeholder="guitar, hướng dẫn, tips" />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}
            >
              {form.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {form.isPublished ? 'Xuất bản' : 'Bản nháp'}
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
