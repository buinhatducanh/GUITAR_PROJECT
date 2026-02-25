import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Eye, Calendar, Tag, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { blogsApi } from '@/app/lib/api';
import { BlogPost } from '@/app/context/AppContext';

export const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await blogsApi.getAll({ published: 'true', limit: 100 });
        const mapped: BlogPost[] = res.posts.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt ?? '',
          content: p.content ?? '',
          coverImage: p.coverImage ?? '',
          authorName: p.authorName ?? '',
          authorAvatar: p.authorAvatar ?? '',
          category: p.category ?? '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          publishedDate: p.publishedDate ?? null,
          readTime: p.readTime ?? 5,
          views: p.views ?? 0,
          isPublished: p.isPublished ?? true,
        }));
        setPosts(mapped);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['all', ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (!a.publishedDate) return 1;
    if (!b.publishedDate) return -1;
    return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-b border-emerald-500/20 mb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-white mb-2">Blog & Tin Tức</h1>
          <p className="text-emerald-300">Cập nhật tin tức mới nhất về guitar và âm nhạc</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === category
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                {category === 'all' ? 'Tất cả' : category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60">Không tìm thấy bài viết nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group cursor-pointer bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-all"
              >
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-900/30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                  {post.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-white/60 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                    {post.publishedDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(post.publishedDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime} phút đọc</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.views}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      {post.authorAvatar && (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-sm text-white/80">{post.authorName}</span>
                    </div>

                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-white/5 text-emerald-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-gradient-to-r from-emerald-900/30 via-teal-900/30 to-emerald-900/30 rounded-3xl p-12 text-center relative overflow-hidden border border-emerald-500/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />

          <div className="relative">
            <h2 className="text-4xl font-bold text-white mb-4">
              Muốn cập nhật tin tức mới nhất?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Đăng ký để nhận thông báo về các bài viết mới và ưu đãi đặc biệt
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50 transition-all"
              >
                Đăng ký
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
