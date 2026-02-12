import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Zap, Star } from 'lucide-react';
import { Product, useApp } from '../context/AppContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, onBuyNow }) => {
  const { addToCart } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success('Đã thêm vào giỏ hàng!', {
      description: product.name,
      duration: 2000
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    onBuyNow(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => onViewDetail(product)}
      className="group relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
    >
      {/* Discount Badge */}
      {product.discount && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute top-4 right-4 z-10 bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
        >
          -{product.discount}%
        </motion.div>
      )}

      {/* Product Image */}
      <div className="relative h-64 overflow-hidden bg-black/20">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
        
        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end justify-center pb-6"
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(product);
            }}
            className="px-6 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 transition-colors"
          >
            Xem nhanh
          </motion.button>
        </motion.div>

        {/* Lighting Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:via-transparent group-hover:to-orange-500/10 transition-all duration-500 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-amber-500 font-medium mb-2 uppercase tracking-wider">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-zinc-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-white/60">({product.rating})</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          {product.oldPrice && (
            <p className="text-sm text-white/40 line-through mb-1">
              {formatPrice(product.oldPrice)}
            </p>
          )}
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-amber-500/50 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Thêm vào giỏ</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all"
          >
            <Zap className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Card Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 rounded-2xl" />
      </div>
    </motion.div>
  );
};
