import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingCart, Zap, Star, X, ZoomIn } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp, Product } from '@/app/context/AppContext';
import { toast } from 'sonner';
import { productsApi } from '@/app/lib/api';
import { ProductDetailSkeleton } from '@/components/atoms/SkeletonLayouts';

export const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const closeZoom = useCallback(() => setIsZoomed(false), []);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    productsApi.getBySlug(slug).then((p: any) => {
      const mapped: Product = {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        oldPrice: p.oldPrice ? Number(p.oldPrice) : undefined,
        discount: p.discount ?? undefined,
        image: p.image ?? '',
        category: typeof p.category === 'object' ? p.category?.name ?? '' : (p.category ?? ''),
        description: p.description ?? '',
        specs: Array.isArray(p.specs) ? p.specs : [],
        rating: p.rating ?? 0,
        reviews: [],
      };
      setProduct(mapped);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!isZoomed) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeZoom(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isZoomed, closeZoom]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-xl mb-4">Không tìm thấy sản phẩm</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl"
          >
            Xem sản phẩm khác
          </motion.button>
        </div>
      </div>
    );
  }

  const images = [product.image, product.image, product.image];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
      description: product.name,
      duration: 2000
    });
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm rounded-full pointer-events-none">
                <ZoomIn className="w-4 h-4" />
                Click to zoom
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {images.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                    ? 'border-amber-500'
                    : 'border-white/10 hover:border-white/30'
                    }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            <p className="text-amber-500 font-medium uppercase tracking-wider">
              {product.category}
            </p>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-zinc-600'
                      }`}
                  />
                ))}
              </div>
              <span className="text-white/60">
                {product.rating} ({product.reviews.length} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="py-6 border-y border-white/10">
              {product.oldPrice && (
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xl text-white/40 line-through">
                    {formatPrice(product.oldPrice)}
                  </p>
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                    Giảm {product.discount}%
                  </span>
                </div>
              )}
              <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Mô tả sản phẩm</h3>
              <p className="text-white/70 leading-relaxed">{product.description}</p>
            </div>

            {/* Specs */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Thông số kỹ thuật</h3>
              <ul className="space-y-2">
                {product.specs.map((spec, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-white font-medium mb-3">Số lượng</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-white font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <p className="text-white/60">
                  Tổng: <span className="text-amber-500 font-bold">{formatPrice(product.price * quantity)}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl border border-white/10 hover:border-amber-500/50 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all"
              >
                <Zap className="w-5 h-5" />
                Mua ngay
              </motion.button>
            </div>

            {/* Reviews Section */}
            {product.reviews.length > 0 && (
              <div className="pt-8 border-t border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Đánh giá</h3>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{review.user}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-600'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-white/70 text-sm">{review.comment}</p>
                      <p className="text-white/40 text-xs mt-2">{review.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Zoom Lightbox */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out"
            onClick={closeZoom}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              onClick={closeZoom}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              src={images[selectedImage]}
              alt={product.name}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
