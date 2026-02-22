import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { shippingApi } from '@/app/lib/api';
import { AdminModal } from '@/components/molecules/AdminModal';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export const ShippingTab: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', baseCost: '', costPerKm: '', freeThreshold: '', estimatedDays: '', order: '0' });

  const load = async () => {
    try {
      const data = await shippingApi.getAdminAll();
      setMethods(data.shippingMethods || []);
    } catch { toast.error('Không thể tải phương thức vận chuyển'); }
  };

  useEffect(() => { load(); }, []);

  const openModal = (method?: any) => {
    if (method) {
      setEditing(method);
      setForm({ name: method.name, description: method.description || '', baseCost: String(method.baseCost), costPerKm: String(method.costPerKm), freeThreshold: String(method.freeThreshold), estimatedDays: method.estimatedDays, order: String(method.order ?? 0) });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', baseCost: '', costPerKm: '', freeThreshold: '', estimatedDays: '', order: '0' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, baseCost: parseFloat(form.baseCost), costPerKm: parseFloat(form.costPerKm), freeThreshold: parseFloat(form.freeThreshold), order: parseInt(form.order) };
      if (editing) {
        await shippingApi.update(editing.id, payload);
        toast.success('Đã cập nhật phương thức vận chuyển');
      } else {
        await shippingApi.create(payload);
        toast.success('Đã thêm phương thức vận chuyển');
      }
      setIsModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi lưu phương thức vận chuyển'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await shippingApi.delete(id);
      toast.success('Đã xóa phương thức vận chuyển');
      load();
    } catch (e: any) { toast.error(e.message || 'Không thể xóa'); }
  };

  const handleToggle = async (id: string) => {
    try {
      await shippingApi.toggle(id);
      load();
    } catch { toast.error('Không thể thay đổi trạng thái'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Vận Chuyển</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all">
          <Plus className="w-5 h-5" />
          Thêm phương thức
        </motion.button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có phương thức vận chuyển nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {methods.map((method) => (
            <div key={method.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-6 h-6 text-orange-400" />
                    <h3 className="text-xl font-bold text-white">{method.name}</h3>
                    <button onClick={() => handleToggle(method.id)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${method.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30'}`}>
                      {method.isActive ? 'Hoạt động' : 'Tạm dừng'}
                    </button>
                  </div>
                  <p className="text-white/60 mb-4">{method.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                      { label: 'Phí cơ bản', value: formatPrice(parseFloat(method.baseCost)) },
                      { label: 'Phí / km', value: formatPrice(parseFloat(method.costPerKm)) },
                      { label: 'Freeship từ', value: formatPrice(parseFloat(method.freeThreshold)) },
                      { label: 'Thời gian', value: method.estimatedDays },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-lg p-3">
                        <p className="text-white/40 text-xs mb-1">{label}</p>
                        <p className="text-white font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openModal(method)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(method.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Chỉnh sửa vận chuyển' : 'Thêm phương thức vận chuyển'}>
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Tên phương thức *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Mô tả</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Phí cơ bản (₫) *</label>
              <input type="number" value={form.baseCost} onChange={e => setForm(f => ({ ...f, baseCost: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Phí/km (₫) *</label>
              <input type="number" value={form.costPerKm} onChange={e => setForm(f => ({ ...f, costPerKm: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Freeship từ (₫) *</label>
              <input type="number" value={form.freeThreshold} onChange={e => setForm(f => ({ ...f, freeThreshold: e.target.value }))} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Thời gian giao *</label>
              <input type="text" value={form.estimatedDays} onChange={e => setForm(f => ({ ...f, estimatedDays: e.target.value }))} placeholder="VD: 3-5 ngày" className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50" />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Hủy</button>
            <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl transition-all">Lưu</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
