import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Star, Package, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { productsApi, categoriesApi, brandsApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';
import { ImageUploadField } from '@/components/molecules/ImageUploadField';

/** format price */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/** empty form */
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

/** helper: unwrap API safely */
const unwrap = (res: any, key?: string) => {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  if (key && Array.isArray(res?.data?.[key])) return res.data[key];
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  /** LOAD DATA */
  const load = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brRes] = await Promise.all([
        productsApi.getAll({
          page,
          limit,
          search,
          sort,
          order,
        }),
        categoriesApi.getAll(),
        brandsApi.getAll(),
      ]);

      // ✅ FIX CHUẨN KHÔNG DÙNG .data
      setProducts(prodRes.products || []);
      setPagination(prodRes.pagination || null);

      setCategories(catRes || []);
      setBrands(brRes?.brands || []);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search, sort, order]);

  /** OPEN MODAL */
  const openModal = (product?: any) => {
    if (product) {
      setEditing(product);
      setForm({
        name: product.name || '',
        price: String(product.price || ''),
        oldPrice: String(product.oldPrice || ''),
        discount: String(product.discount || ''),
        image: product.image || '',
        categoryId: product.category?.id || '',
        brandId: product.brand?.id || '',
        description: product.description || '',
        stock: String(product.stock || 0),
        isFeatured: product.isFeatured || false,
        isActive: product.isActive ?? true,
      });
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setIsModalOpen(true);
  };

  /** SAVE */
  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Thiếu dữ liệu');

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        discount: form.discount ? Number(form.discount) : null,
        image: form.image,
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
        description: form.description,
        stock: Number(form.stock),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      if (editing) {
        await productsApi.update(editing.id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await productsApi.create(payload);
        toast.success('Thêm thành công');
      }

      setIsModalOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  /** DELETE */
  const handleDelete = async (id: string) => {
    if (!confirm('Xóa sản phẩm?')) return;

    try {
      await productsApi.delete(id);
      toast.success('Đã xóa');
      load();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between mb-5">
        <h2 className="text-white text-2xl font-bold">
          Sản phẩm ({pagination?.total || 0})
        </h2>

        {/* <div className="flex gap-2">

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm..."
            className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl"
          >
            <option value="createdAt">Mới nhất</option>
            <option value="name">Tên</option>
            <option value="price">Giá</option>
          </select>

          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl"
          >
            {order === 'asc' ? 'A-Z' : 'Z-A'}
          </button>

          <button
            onClick={load}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl"
          >
            <Plus />
          </button>

        </div> */}
        <div className="flex gap-3 items-center flex-wrap">

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-64 px-4 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-xl focus:outline-none focus:border-purple-500/50"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-40 px-4 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-xl focus:outline-none"
          >
            <option value="createdAt" className="bg-zinc-900">Mới nhất</option>
            <option value="name" className="bg-zinc-900">Tên</option>
            <option value="price" className="bg-zinc-900">Giá</option>
          </select>

          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition"
          >
            {order === 'asc' ? 'A → Z' : 'Z → A'}
          </button>

          <button
            onClick={load}
            className="px-4 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            <Plus className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">

          <table className="w-full text-white">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-left">Tên</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Kho</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="p-3 flex gap-3 items-center">
                    <img src={p.image} className="w-10 h-10 rounded" />
                    {p.name}
                  </td>

                  <td className="p-3 text-center">{p.category?.name || '—'}</td>

                  <td className="p-3 text-center">
                    {formatPrice(Number(p.price))}
                  </td>

                  <td className="p-3 text-center">{p.stock}</td>

                  <td className="p-3 text-center">
                    {p.isActive ? 'Hiện' : 'Ẩn'}
                  </td>

                  <td className="p-3 text-right flex justify-end gap-2">
                    <button onClick={() => openModal(p)}>
                      <Edit />
                    </button>
                    <button onClick={() => handleDelete(p.id)}>
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* PAGINATION */}
      {pagination && (
        <div className="flex justify-center gap-3 mt-4 text-white">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>{page} / {pagination.totalPages}</span>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* MODAL giữ nguyên */}
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