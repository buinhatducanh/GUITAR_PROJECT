import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Percent, Tag, TrendingDown, Zap, Clock, Gift, Sparkles } from 'lucide-react';
import { useApp, Product } from '../context/AppContext';
import { ProductCard } from './ProductCard';

interface PromoProps {
  onBack: () => void;
  onViewProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const Promo: React.FC<PromoProps> = ({ onBack, onViewProduct, onBuyNow }) => {
  const { products } = useApp();
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'name'>('discount');

  const promoProducts = products.filter(p => p.discount && p.discount > 0);

  const sortedProducts = [...promoProducts].sort((a, b) => {
    if (sortBy === 'discount') {
      return (b.discount || 0) - (a.discount || 0);
    } else if (sortBy === 'price') {
      return a.price - b.price;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const maxDiscount = Math.max(...promoProducts.map(p => p.discount || 0));
  const totalSavings = promoProducts.reduce((sum, p) => sum + (p.oldPrice || p.price) - p.price, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-red-950/40 via-black to-orange-950/40 border-b border-red-500/20 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 py-12 relative">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="flex items-center gap-3 mb-4"
              >
                <Zap className="w-12 h-12 text-red-500 fill-red-500" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Flash Sale
                </h1>
              </motion.div>
              <p className="text-2xl text-white/90 mb-2">Giảm giá đến {maxDiscount}% 🔥</p>
              <p className="text-orange-300">
                Tiết kiệm tổng cộng: {formatPrice(totalSavings)}
              </p>
            </div>

            {/* Countdown Timer (Mock) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">Kết thúc sau:</span>
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'Giờ', value: '23' },
                  { label: 'Phút', value: '45' },
                  { label: 'Giây', value: '12' }
                ].map((time, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-red-500 text-white font-bold text-2xl px-4 py-2 rounded-lg mb-1">
                      {time.value}
                    </div>
                    <span className="text-xs text-white/60">{time.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-2xl p-6 border border-red-500/20"
          >
            <Percent className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-red-200 text-sm mb-1">Giảm giá cao nhất</p>
            <p className="text-4xl font-bold text-white">{maxDiscount}%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-900/30 to-orange-800/30 rounded-2xl p-6 border border-orange-500/20"
          >
            <Tag className="w-10 h-10 text-orange-400 mb-3" />
            <p className="text-orange-200 text-sm mb-1">Sản phẩm khuyến mãi</p>
            <p className="text-4xl font-bold text-white">{promoProducts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-2xl p-6 border border-yellow-500/20"
          >
            <TrendingDown className="w-10 h-10 text-yellow-400 mb-3" />
            <p className="text-yellow-200 text-sm mb-1">Tổng tiết kiệm</p>
            <p className="text-2xl font-bold text-white">{formatPrice(totalSavings)}</p>
          </motion.div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-white font-semibold">Sắp xếp theo:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'discount', label: 'Giảm giá' },
              { id: 'price', label: 'Giá' },
              { id: 'name', label: 'Tên' }
            ].map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSortBy(option.id as any)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  sortBy === option.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Products Grid with Special Layout */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60">Hiện tại không có sản phẩm khuyến mãi nào</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, rotate: idx % 2 === 0 ? 1 : -1 }}
                className="relative"
              >
                {/* Discount Badge */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  className="absolute -top-3 -right-3 z-10"
                >
                  <div className="relative">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/50">
                      <span className="text-2xl">-{product.discount}%</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-xl opacity-50 -z-10" />
                  </div>
                </motion.div>

                {/* Savings Badge */}
                {product.oldPrice && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.2 }}
                    className="absolute top-3 left-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                  >
                    Tiết kiệm {formatPrice(product.oldPrice - product.price)}
                  </motion.div>
                )}

                <ProductCard
                  product={product}
                  onViewDetail={onViewProduct}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-gradient-to-r from-red-900/30 via-orange-900/30 to-red-900/30 rounded-3xl p-12 text-center relative overflow-hidden border border-red-500/20"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_70%)]" />
          </div>
          
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Zap className="w-10 h-10 text-white fill-white" />
            </motion.div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Đừng bỏ lỡ ưu đãi!
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Chương trình khuyến mãi có hạn. Nhanh tay sở hữu guitar mơ ước với giá tốt nhất.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(239, 68, 68, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-12 py-5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold text-lg rounded-full shadow-lg shadow-red-500/50 transition-all"
            >
              🔥 Mua ngay kẻo lỡ
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
