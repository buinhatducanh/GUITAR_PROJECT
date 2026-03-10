import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { ProductCard } from '@/components/organisms/ProductCard';
import { Product } from '@/app/context/AppContext';
import { ProductGridSkeleton } from '@/components/atoms/SkeletonLayouts';
import { useProducts, mapProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/lib/queryKeys';
import { productsApi } from '@/app/lib/api';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onBack = () => navigate(-1);
  const onViewProduct = (product: Product) => navigate(`/products/${product.slug}`);
  const onBuyNow = (_product: Product) => navigate('/checkout');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useProducts({ limit: 100 });
  const products = data?.products || [];

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <Helmet>
        <title>Sản Phẩm Guitar | Guitar NOVA</title>
        <meta name="description" content="Khám phá bộ sưu tập guitar acoustic, classic, electric chính hãng tại Guitar NOVA. Giá tốt nhất, giao hàng toàn quốc." />
        <meta property="og:title" content="Sản Phẩm Guitar | Guitar NOVA" />
        <meta property="og:description" content="Bộ sưu tập guitar chính hãng tại Guitar NOVA" />
      </Helmet>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            Tất cả sản phẩm
          </h1>
          <p className="text-xl text-white/60">
            Khám phá bộ sưu tập guitar cao cấp của chúng tôi
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  : 'bg-zinc-900 text-white/60 hover:text-white border border-white/10 hover:border-amber-500/50'
                  }`}
              >
                {category === 'all' ? 'Tất cả' : category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => {
                  queryClient.prefetchQuery({
                    queryKey: queryKeys.products.detail(product.slug),
                    queryFn: async () => {
                      const p = await productsApi.getBySlug(product.slug);
                      return mapProduct(p);
                    },
                    staleTime: 5 * 60 * 1000,
                  });
                }}
              >
                <ProductCard
                  product={product}
                  onViewDetail={onViewProduct}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-white/60">Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
