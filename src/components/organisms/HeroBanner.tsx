import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBanners } from '@/hooks/useBanners';
export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: bannersData = [] } = useBanners();
  const activeBanners = bannersData.filter((b: any) => b.isActive);

  useEffect(() => {
    if (activeBanners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  if (activeBanners.length === 0) {
    return (
      <div className="relative h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Guitar NOVA
          </h1>
          <p className="text-xl lg:text-2xl text-white/60">
            Khám phá thế giới âm nhạc
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image with Parallax */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: 'linear' }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${activeBanners[currentSlide].image})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </motion.div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight"
              >
                {activeBanners[currentSlide].title}
              </motion.h1>

              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl lg:text-2xl text-white/80 mb-8 leading-relaxed"
              >
                {activeBanners[currentSlide].subtitle}
              </motion.p>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(activeBanners[currentSlide].link)}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-full hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                  Xem chi tiết
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/products')}
                  className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  Mua ngay
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          aria-label="Ảnh trước đó"
          className="p-3 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          aria-label="Ảnh tiếp theo"
          className="p-3 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors pointer-events-auto"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {activeBanners.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            aria-label={`Đi đến ảnh slide ${index + 1}`}
            className={`h-1 rounded-full transition-all ${index === currentSlide
              ? 'w-12 bg-gradient-to-r from-amber-500 to-orange-600'
              : 'w-8 bg-white/30 hover:bg-white/50'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
