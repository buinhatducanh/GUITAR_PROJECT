import React from 'react';
import { motion } from 'motion/react';
import { Plus, Award } from 'lucide-react';
import { Event } from '@/app/context/AppContext';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface EventsTabProps {
  events: Event[];
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  onAdd: () => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({ events, onDelete, onEdit, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Quản lý Sự kiện</h2>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
        <Plus className="w-5 h-5" />
        Thêm sự kiện
      </motion.button>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {events.map((event) => (
        <div key={event.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
          <div className="relative h-48">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${event.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {event.isActive ? 'Đang diễn ra' : 'Tạm dừng'}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
            <p className="text-white/60 text-sm mb-3 line-clamp-2">{event.description}</p>
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Award className="w-5 h-5" />
              <span className="text-sm">
                {event.reward.type === 'points' && `+${event.reward.value} điểm`}
                {event.reward.type === 'discount' && `Giảm ${event.reward.value}%`}
              </span>
            </div>
            <p className="text-xs text-white/40 mb-4">{formatDate(event.startDate)} - {formatDate(event.endDate)}</p>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onEdit(event)} className="flex-1 py-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm">
                Chỉnh sửa
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onDelete(event.id)} className="flex-1 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
                Xóa
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
