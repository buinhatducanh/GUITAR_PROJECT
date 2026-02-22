import React from 'react';
import { motion } from 'motion/react';
import { Plus, Star } from 'lucide-react';
import { Voucher } from '@/app/context/AppContext';

interface VouchersTabProps {
  vouchers: Voucher[];
  onDelete: (id: string) => void;
  onEdit: (voucher: Voucher) => void;
  onAdd: () => void;
}

export const VouchersTab: React.FC<VouchersTabProps> = ({ vouchers, onDelete, onEdit, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Quản lý Voucher</h2>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
        <Plus className="w-5 h-5" />
        Thêm voucher
      </motion.button>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vouchers.map((voucher) => (
        <div key={voucher.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-amber-500/20">
          <div className="relative h-32">
            <img src={voucher.image} alt={voucher.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${voucher.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {voucher.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </div>
          </div>
          <div className="p-5">
            <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-3">
              <span className="text-amber-400 font-mono font-bold text-sm">{voucher.code}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{voucher.title}</h3>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="font-bold">{voucher.pointsCost.toLocaleString('vi-VN')} điểm</span>
            </div>
            <p className="text-xs text-white/50 mb-4">Đã dùng: {voucher.usedCount}/{voucher.usageLimit}</p>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onEdit(voucher)} className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm">
                Chỉnh sửa
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onDelete(voucher.id)} className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
                Xóa
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
