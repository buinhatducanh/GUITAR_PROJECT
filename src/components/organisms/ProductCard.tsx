import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Zap, Star } from 'lucide-react';
import { Product, useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onViewDetail: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  onBuyNow
}) => {
  const { addToCart } = useApp();

  // ==================================================
  // Helpers
  // ==================================================

  const categoryName =
    typeof product.category === 'object' &&
      product.category !== null
      ? (product.category as any).name
      : product.category;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // ==================================================
  // Handlers
  // ==================================================

  const handleViewDetail = () => {
    onViewDetail(product);
  };

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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();

    handleViewDetail();
  };

  // ==================================================
  // Render
  // ==================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={handleViewDetail}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900 to-zinc-950 transition-all duration-300 hover:border-amber-500/30"
    >
      {/* ==================================================
          Discount Badge
      ================================================== */}

      {product.discount && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="absolute right-4 top-4 z-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 px-3 py-1 text-sm font-bold text-white shadow-lg"
        >
          -{product.discount}%
        </motion.div>
      )}

      {/* ==================================================
          Product Image
      ================================================== */}

      <div className="relative h-64 overflow-hidden bg-black/20">
        <motion.img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Hover Overlay */}

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black via-black/50 to-transparent pb-6"
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            onClick={handleQuickView}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Xem nhanh
          </motion.button>
        </motion.div>

        {/* Lighting Effect */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/0 via-amber-500/0 to-amber-500/0 transition-all duration-500 group-hover:from-amber-500/10 group-hover:via-transparent group-hover:to-orange-500/10" />
      </div>

      {/* ==================================================
          Product Info
      ================================================== */}

      <div className="p-5">
        {/* Category */}

        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-amber-500">
          {categoryName}
        </p>

        {/* Product Name */}

        <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-amber-400">
          {product.name}
        </h3>

        {/* ==================================================
            Rating
        ================================================== */}

        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${index < Math.floor(product.rating)
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-zinc-600'
                  }`}
              />
            ))}
          </div>

          <span className="text-sm text-white/60">
            ({product.rating})
          </span>
        </div>

        {/* ==================================================
            Price
        ================================================== */}

        <div className="mb-4">
          {product.oldPrice && (
            <p className="mb-1 text-sm text-white/40 line-through">
              {formatPrice(product.oldPrice)}
            </p>
          )}

          <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-2xl font-bold text-transparent">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* ==================================================
            Action Buttons
        ================================================== */}

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:border-amber-500/50 hover:bg-white/10"
          >
            <ShoppingCart className="h-4 w-4" />

            <span className="text-sm font-medium">
              Thêm vào giỏ
            </span>
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBuyNow}
            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 text-white transition-all hover:from-amber-600 hover:to-orange-700"
          >
            <Zap className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* ==================================================
          Card Glow Effect
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
      </div>
    </motion.div>
  );
};