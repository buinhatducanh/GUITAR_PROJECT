import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Share2, Heart, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useBlogDetail } from '@/hooks/useBlogs';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const settings = useSettingsStore((state) => state.settings);
  const { data: post, isLoading: loading } = useBlogDetail(slug || '');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-white/60">Không tìm thấy bài viết</p>
        <button onClick={() => navigate('/blog')} className="text-emerald-400 hover:underline">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </motion.button>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Category */}
          {post.category && (
            <div className="mb-4">
              <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-full">
                {post.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-white/60 mb-6">
            <div className="flex items-center gap-2">
              {post.authorAvatar && (
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-sm text-white/80 font-medium">{post.authorName}</p>
                <p className="text-xs text-white/40">Tác giả</p>
              </div>
            </div>

            {post.publishedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(post.publishedDate)}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{post.readTime} phút đọc</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{post.views} lượt xem</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
            >
              <Heart className="w-4 h-4" />
              <span className="text-sm">Thích</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Chia sẻ</span>
            </motion.button>
          </div>
        </motion.article>

        {/* Cover Image */}
        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 rounded-2xl overflow-hidden"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-invert prose-lg max-w-none mb-12"
        >
          <div className="text-white/80 leading-relaxed space-y-6">
            <p className="text-xl text-white/90 font-medium mb-8">
              {post.excerpt}
            </p>

            <div className="space-y-4 text-white/70">
              {post.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-5 h-5 text-emerald-400" />
              {post.tags.map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium cursor-pointer hover:from-emerald-600/30 hover:to-teal-600/30 transition-all"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-12" />

        {/* Author Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-8 border border-emerald-500/20 mb-12"
        >
          <div className="flex items-center gap-4">
            {post.authorAvatar && (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">
                {post.authorName}
              </h3>
              <p className="text-white/60 text-sm mb-3">
                Chuyên gia tư vấn guitar tại {settings?.siteName || 'Guitar NOVA'}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Theo dõi
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Xem thêm bài viết
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Related Posts Suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-emerald-900/20 rounded-2xl p-8 text-center border border-emerald-500/20"
        >
          <h3 className="text-2xl font-bold text-white mb-2">
            Bài viết hay? Đọc thêm nhé!
          </h3>
          <p className="text-white/60 mb-6">
            Khám phá thêm nhiều bài viết hữu ích về guitar và âm nhạc
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/blog')}
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50 transition-all"
          >
            Xem thêm bài viết
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};
