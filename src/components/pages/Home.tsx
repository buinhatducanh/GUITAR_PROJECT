import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Trophy, Zap, Tag, Gift, Sparkles, ArrowRight, Calendar, TrendingUp, Award, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp, Product } from '@/app/context/AppContext';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ProductCard } from '@/components/organisms/ProductCard';
import { HeroBanner } from '@/components/organisms/HeroBanner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products, events, vouchers, landingPages, blogPosts } = useApp();
  const addItem = useCartStore((state) => state.addItem);

  const featuredProducts = products.slice(0, 4);
  const newProducts = products.slice(4, 8);
  const saleProducts = products.filter(p => p.discount).slice(0, 4);
  const activeEvents = events.filter(e => e.isActive).slice(0, 2);
  const topVouchers = vouchers.filter(v => v.isActive).slice(0, 3);
  const publishedLandingPages = landingPages.filter(lp => lp.isPublished).slice(0, 2);
  const publishedBlogs = blogPosts.filter(bp => bp.isPublished).slice(0, 3);

  const onViewProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const onBuyNow = (product: Product) => {
    navigate('/checkout');
  };

  const onNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Quick Actions - Events & Rewards */}
      <section className="py-12 bg-gradient-to-b from-black to-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Events Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate('/events')}
              className="group bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.15),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    {activeEvents.length} sự kiện
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Sự Kiện Hot</h3>
                <p className="text-purple-200/80 mb-4">
                  Tham gia ngay để nhận điểm thưởng và voucher
                </p>
                <div className="flex items-center gap-2 text-purple-300 font-medium group-hover:gap-4 transition-all">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            {/* Rewards Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => onNavigate('/rewards')}
              className="group bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-8 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.15),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Gift className="w-8 h-8 text-amber-400" />
                  </div>
                  <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {topVouchers.length} voucher
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Đổi Quà Thưởng</h3>
                <p className="text-amber-200/80 mb-4">
                  Dùng điểm tích lũy để đổi voucher giảm giá
                </p>
                <div className="flex items-center gap-2 text-amber-300 font-medium group-hover:gap-4 transition-all">
                  <span>Đổi quà ngay</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Section - Grid Layout */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-black to-zinc-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="text-amber-500 font-medium uppercase tracking-wider">Nổi bật</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-xl text-white/60">
              Những cây đàn được yêu thích nhất tại Guitar NOVA
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onViewDetail={onViewProduct}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('/products')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 hover:border-amber-500/50 transition-all"
            >
              Xem tất cả sản phẩm
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals - Horizontal Scroll */}
      <section className="py-20 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <span className="text-blue-500 font-medium uppercase tracking-wider">Mới nhất</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Hàng Mới Về
              </h2>
              <p className="text-xl text-white/60">
                Cập nhật những mẫu guitar mới nhất
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('/products')}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium rounded-xl border border-blue-500/30 transition-all"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Horizontal Scroll Container */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            <div className="flex gap-6" style={{ width: 'max-content' }}>
              {newProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  style={{ width: '300px' }}
                >
                  <ProductCard
                    product={product}
                    onViewDetail={onViewProduct}
                    onBuyNow={onBuyNow}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sale Section - Special Layout */}
      {saleProducts.length > 0 && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black to-orange-950/30" />
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Zap className="w-8 h-8 text-red-500 fill-red-500" />
                <span className="text-red-500 font-bold uppercase tracking-wider text-lg">Flash Sale</span>
                <Zap className="w-8 h-8 text-red-500 fill-red-500" />
              </motion.div>
              <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                Giảm Giá Đặc Biệt
              </h2>
              <p className="text-xl text-white/70">
                Đừng bỏ lỡ cơ hội sở hữu guitar mơ ước với giá tốt nhất
              </p>
            </motion.div>

            {/* Special Grid Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {saleProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
                >
                  <div className="relative">
                    {/* Sale Badge */}
                    {product.discount && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-3 -right-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-red-500/50"
                      >
                        -{product.discount}%
                      </motion.div>
                    )}
                    <ProductCard
                      product={product}
                      onViewDetail={onViewProduct}
                      onBuyNow={onBuyNow}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('/promo')}
                className="px-10 py-5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg rounded-full transition-all shadow-lg shadow-red-500/50"
              >
                🔥 Xem tất cả khuyến mãi HOT
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Vouchers Showcase */}
      {topVouchers.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-zinc-950">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="w-6 h-6 text-amber-500" />
                <span className="text-amber-500 font-medium uppercase tracking-wider">Ưu đãi</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Voucher Hot Nhất
              </h2>
              <p className="text-xl text-white/60">
                Đổi điểm ngay để nhận ưu đãi hấp dẫn
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {topVouchers.map((voucher, idx) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => onNavigate('/rewards')}
                  className="group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={voucher.image}
                      alt={voucher.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  </div>
                  <div className="p-5">
                    <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-3">
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {voucher.code}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                      {voucher.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-xl font-bold text-amber-400">
                        {voucher.pointsCost.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-amber-300/60">điểm</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('/rewards')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
              >
                Xem tất cả voucher
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-zinc-950 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-3xl p-12 lg:p-16 border border-amber-500/20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]" />
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Bắt đầu hành trình âm nhạc của bạn
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Khám phá bộ sưu tập guitar cao cấp và tìm cây đàn hoàn hảo dành cho bạn
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('/products')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-full transition-all"
                >
                  Khám phá ngay
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('/landing/about')}
                  className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Về chúng tôi
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Landing Pages Section */}
      {publishedLandingPages.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-black to-zinc-950 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05),transparent_50%)]" />

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
                <span className="text-blue-400 font-medium uppercase tracking-wider">Nổi bật</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Khám Phá Thêm
              </h2>
              <p className="text-xl text-white/60">
                Những bộ sưu tập và câu chuyện đặc biệt từ Guitar NOVA
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {publishedLandingPages.map((page, idx) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  whileHover={{ y: -10 }}
                  onClick={() => onNavigate(`/landing/${page.slug}`)}
                  className="group bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="relative h-64 overflow-hidden">
                    {page.sections[0]?.images?.[0] && (
                      <img
                        src={page.sections[0].images[0]}
                        alt={page.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        Landing Page
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </h3>
                    <p className="text-white/60 mb-4 line-clamp-2">
                      {page.subtitle}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-white/40">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(page.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-4 transition-all">
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('/landing')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all"
              >
                Xem tất cả Landing Pages
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      {publishedBlogs.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-zinc-950 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(234,88,12,0.05),transparent_50%)]" />

          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-orange-400" />
                <span className="text-orange-400 font-medium uppercase tracking-wider">Blog</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Bài Viết Nổi Bật
              </h2>
              <p className="text-xl text-white/60">
                Kiến thức, hướng dẫn và câu chuyện về guitar
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {publishedBlogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => onNavigate(`/blog/${blog.slug}`)}
                  className="group bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-orange-500/20 hover:border-orange-500/50 transition-all cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        {blog.category}
                      </span>
                    </div>

                    {/* Read Time */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-full">
                        {blog.readTime} phút đọc
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>

                    {/* Author & Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm text-white/60">{blog.author.name}</span>
                      </div>
                      <span className="text-xs text-white/40">
                        {new Date(blog.publishedDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('/blog')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all"
              >
                Xem tất cả bài viết
              </motion.button>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};