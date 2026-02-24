import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Product } from '@/app/context/AppContext';
import { ProductCard } from '@/components/organisms/ProductCard';
import { productsApi, categoriesApi } from '@/app/lib/api';
import { ICON_MAP } from '@/components/organisms/admin/CategoriesTab';
import { CategoryGridSkeleton, ProductGridSkeleton } from '@/components/atoms/SkeletonLayouts';

const COLORS = [
  'from-zinc-500 to-zinc-600',
  'from-blue-500 to-blue-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-red-500 to-red-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-teal-600',
];

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const onBack = () => navigate(-1);
  const onViewProduct = (product: Product) => navigate(`/products/${product.id}`);
  const onBuyNow = (_product: Product) => navigate('/checkout');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ id: string; name: string; icon: any; color: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ limit: 100 }),
      categoriesApi.getAll(),
    ]).then(([prodRes, cats]) => {
      const mapped: Product[] = prodRes.products.map((p: any) => ({
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
      }));
      setProducts(mapped);

      const totalCount = mapped.length;
      const catList = [
        { id: 'all', name: 'Tất cả', icon: Package, color: COLORS[0], count: totalCount },
        ...cats.map((c: any, idx: number) => ({
          id: c.name,
          name: c.name,
          icon: ICON_MAP[c.icon] || Package,
          color: COLORS[(idx + 1) % COLORS.length],
          count: c._count?.products ?? 0,
        })),
      ];
      setCategories(catList);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-b border-indigo-500/20 mb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-white mb-2">Danh Mục Sản Phẩm</h1>
          <p className="text-indigo-300">Khám phá guitar và thiết bị âm nhạc theo từng danh mục</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Categories Grid */}
        {isLoading ? (
          <div className="mb-12"><CategoryGridSkeleton count={7} /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {categories.map((category, idx) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative overflow-hidden rounded-2xl p-6 transition-all ${isSelected
                    ? `bg-gradient-to-br ${category.color} shadow-lg`
                    : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 hover:border-white/20'
                    }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selectedCategory"
                      className="absolute inset-0 bg-white/10"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="relative">
                    <Icon className={`w-10 h-10 mb-3 mx-auto ${isSelected ? 'text-white' : 'text-white/60'
                      }`} />
                    <h3 className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-white/80'
                      }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-white/40'
                      }`}>
                      {category.count} sản phẩm
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Selected Category Info */}
        {selectedCategoryData && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${selectedCategoryData.color} rounded-2xl p-8 mb-8 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_70%)]" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedCategoryData.name}
                </h2>
                <p className="text-white/90">
                  Tìm thấy {filteredProducts.length} sản phẩm trong danh mục này
                </p>
              </div>
              <selectedCategoryData.icon className="w-20 h-20 text-white/20" />
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60">Không có sản phẩm nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard
                  product={product}
                  onViewDetail={onViewProduct}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
