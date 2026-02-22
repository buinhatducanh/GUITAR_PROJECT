import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Review } from '@/app/context/AppContext';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

interface ReviewsTabProps {
  reviews: Review[];
  onDelete: (id: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviews, onDelete }) => (
  <div>
    <h2 className="text-2xl font-bold text-white mb-6">Quản lý đánh giá</h2>

    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full" />
              <div>
                <p className="text-white font-medium">{review.user}</p>
                <p className="text-white/40 text-sm">{review.productName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'}`} />
                ))}
              </div>
              <span className="text-white/60 text-sm">{formatDate(review.date)}</span>
            </div>
          </div>
          <p className="text-white/80 mb-4">{review.comment}</p>
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-4">
              {review.images.map((img, idx) => (
                <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onDelete(review.id)} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">
              Xóa đánh giá
            </motion.button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
