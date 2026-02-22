import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, AlertTriangle, X, Warehouse, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryApi } from '@/app/lib/api';
import { StatCard } from '@/components/molecules/StatCard';
import { AdminModal } from '@/components/molecules/AdminModal';

export const InventoryTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjusting, setAdjusting] = useState<any>(null);
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    try {
      const [overview, low] = await Promise.all([inventoryApi.getOverview(), inventoryApi.getLowStock()]);
      setStats(overview);
      setLowStock(low.products || []);
    } catch { toast.error('Không thể tải dữ liệu kho hàng'); }
  };

  useEffect(() => { load(); }, []);

  const handleAdjust = async () => {
    if (!adjusting || !qty) return;
    try {
      await inventoryApi.adjust(adjusting.id, parseInt(qty), 'IN', notes);
      toast.success('Đã cập nhật tồn kho');
      setIsAdjustOpen(false);
      setQty('');
      setNotes('');
      load();
    } catch (e: any) { toast.error(e.message || 'Lỗi khi điều chỉnh kho'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Quản lý Kho Hàng</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={load} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all">
          <TrendingUp className="w-5 h-5" />
          Làm mới
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} label="Tổng sản phẩm" value={stats?.totalProducts ?? '—'} color="green" />
        <StatCard icon={AlertTriangle} label="Sắp hết hàng" value={stats?.lowStockCount ?? '—'} color="yellow" />
        <StatCard icon={X} label="Hết hàng" value={stats?.outOfStockCount ?? '—'} color="red" />
        <StatCard icon={Warehouse} label="Tổng số lượng" value={stats?.totalStock?.toLocaleString('vi-VN') ?? '—'} color="blue" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Cảnh báo sắp hết hàng
        </h3>
        {lowStock.length === 0 ? (
          <div className="text-center py-10 text-white/40">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Không có sản phẩm sắp hết hàng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStock.map((product) => (
              <div key={product.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-xl p-4 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                      <div>
                        <h4 className="text-white font-semibold">{product.name}</h4>
                        <p className="text-white/40 text-sm">{product.category?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white/40 text-xs">Tồn kho</p>
                      <p className="text-2xl font-bold text-yellow-400">{product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs">Mức cảnh báo</p>
                      <p className="text-white font-semibold">{product.lowStockAlert}</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setAdjusting(product); setIsAdjustOpen(true); }} className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm font-semibold">
                      Nhập thêm
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal isOpen={isAdjustOpen && !!adjusting} onClose={() => setIsAdjustOpen(false)} title="Nhập thêm hàng" maxWidth="max-w-md">
        <div>
          <p className="text-white/60 mb-4">{adjusting?.name}</p>
          <p className="text-sm text-white/40 mb-6">Tồn kho hiện tại: <span className="text-yellow-400 font-bold">{adjusting?.stock}</span></p>
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Số lượng nhập *</label>
              <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50" placeholder="VD: 10" />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Ghi chú</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50" placeholder="Lý do nhập hàng..." />
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setIsAdjustOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl">Hủy</button>
              <button onClick={handleAdjust} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl">Xác nhận nhập</button>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
