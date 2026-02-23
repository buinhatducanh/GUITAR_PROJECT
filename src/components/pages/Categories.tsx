import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Guitar, Music, Radio, Zap, Package } from 'lucide-react';
import { useApp, Product } from '@/app/context/AppContext';
import { ProductCard } from '@/components/organisms/ProductCard';

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const onBack = () => navigate(-1);
  const onViewProduct = (product: Product) => navigate(`/products/${product.id}`);
  const onBuyNow = (_product: Product) => navigate('/checkout');
  const { products } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { 
      id: 'all', 
      name: 'Tất cả', 
      icon: Package,
      color: 'from-zinc-500 to-zinc-600',
      count: products.length
    },
    { 
      id: 'Electric Guitar', 
      name: 'Guitar Điện', 
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      count: products.filter(p => p.category === 'Electric Guitar').length
    },
    { 
      id: 'Acoustic Guitar', 
      name: 'Guitar Acoustic', 
      icon: Guitar,
      color: 'from-amber-500 to-orange-600',
      count: products.filter(p => p.category === 'Acoustic Guitar').length
    },
    { 
      id: 'Bass Guitar', 
      name: 'Bass Guitar', 
      icon: Music,
      color: 'from-purple-500 to-purple-600',
      count: products.filter(p => p.category === 'Bass Guitar').length
    },
    { 
      id: 'Amplifier', 
      name: 'Amplifier', 
      icon: Radio,
      color: 'from-green-500 to-green-600',
      count: products.filter(p => p.category === 'Amplifier').length
    },
    { 
      id: 'Effects', 
      name: 'Effects', 
      icon: Zap,
      color: 'from-red-500 to-red-600',
      count: products.filter(p => p.category === 'Effects').length
    },
    { 
      id: 'Accessories', 
      name: 'Phụ kiện', 
      icon: Package,
      color: 'from-pink-500 to-pink-600',
      count: products.filter(p => p.category === 'Accessories').length
    }
  ];

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
                className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                  isSelected
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
                  <Icon className={`w-10 h-10 mb-3 mx-auto ${
                    isSelected ? 'text-white' : 'text-white/60'
                  }`} />
                  <h3 className={`font-semibold mb-1 ${
                    isSelected ? 'text-white' : 'text-white/80'
                  }`}>
                    {category.name}
                  </h3>
                  <p className={`text-sm ${
                    isSelected ? 'text-white/90' : 'text-white/40'
                  }`}>
                    {category.count} sản phẩm
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

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
        {filteredProducts.length === 0 ? (
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
