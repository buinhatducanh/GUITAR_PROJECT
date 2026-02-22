import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { LandingPageData } from '@/app/context/AppContext';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface LandingPagesTabProps {
  pages: LandingPageData[];
  onDelete: (id: string) => void;
  onEdit: (page: LandingPageData) => void;
  onAdd: () => void;
}

export const LandingPagesTab: React.FC<LandingPagesTabProps> = ({ pages, onDelete, onEdit, onAdd }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-white">Quản lý Landing Pages</h2>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all">
        <Plus className="w-5 h-5" />
        Thêm landing page
      </motion.button>
    </div>

    <div className="space-y-4">
      {pages.map((page) => (
        <div key={page.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{page.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${page.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                  {page.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
              <p className="text-white/60 mb-2">{page.subtitle}</p>
              <p className="text-white/40 text-sm">Slug: {page.slug}</p>
              <p className="text-white/40 text-sm">Ngày tạo: {formatDate(page.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onEdit(page)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onDelete(page.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
