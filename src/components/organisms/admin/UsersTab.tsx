import React from 'react';
import { motion } from 'motion/react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserData } from '@/app/context/AppContext';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

interface UsersTabProps {
  users: UserData[];
  onDelete: (id: string) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, onDelete }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Quản lý người dùng</h2>

    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-white/80 font-medium">Người dùng</th>
              <th className="px-6 py-4 text-left text-white/80 font-medium">Email</th>
              <th className="px-6 py-4 text-left text-white/80 font-medium">Hạng</th>
              <th className="px-6 py-4 text-left text-white/80 font-medium">Điểm</th>
              <th className="px-6 py-4 text-left text-white/80 font-medium">Tổng chi</th>
              <th className="px-6 py-4 text-right text-white/80 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/40 text-sm">{user.totalOrders} đơn hàng</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/60">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.tier === 'platinum' ? 'bg-purple-500/20 text-purple-400' :
                    user.tier === 'gold' ? 'bg-amber-500/20 text-amber-400' :
                    user.tier === 'silver' ? 'bg-zinc-500/20 text-zinc-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {user.tier.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{user.points.toLocaleString('vi-VN')}</td>
                <td className="px-6 py-4 text-amber-500 font-medium">{formatPrice(user.totalSpent)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toast.success('Chức năng đang phát triển')} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(user.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
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
  </div>
);
