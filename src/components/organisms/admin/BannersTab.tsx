import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Banner } from '@/app/context/AppContext';

interface BannersTabProps {
  banners: Banner[];
  onDelete: (id: string) => void;
  onEdit: (banner: Banner) => void;
  onAdd: () => void;
}

export const BannersTab: React.FC<BannersTabProps> = ({ banners, onDelete, onEdit, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Quản lý Banner</h2>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
        <Plus className="w-5 h-5" />
        Thêm banner
      </motion.button>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {banners.map((banner) => (
        <div key={banner.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10">
          <div className="relative h-48">
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-white font-bold mb-1">{banner.title}</h3>
              <p className="text-white/60 text-sm">{banner.subtitle}</p>
            </div>
          </div>
          <div className="p-4 flex justify-end gap-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(banner)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(banner.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
