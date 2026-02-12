import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Award, Heart, Users, Zap } from 'lucide-react';

interface LandingPagesProps {
  page: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export const LandingPages: React.FC<LandingPagesProps> = ({ page, onBack, onNavigate }) => {
  if (page === '/landing/collection-2026') {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Bộ Sưu Tập
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Mới 2026
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              Khám phá những mẫu guitar tinh hoa từ các thương hiệu hàng đầu thế giới.
              Công nghệ hiện đại kết hợp nghệ thuật truyền thống.
            </p>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative h-[500px] rounded-3xl overflow-hidden mb-16"
          >
            <img
              src="https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBtdXNpY2lhbiUyMGNvbmNlcnQlMjBzdGFnZXxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Collection 2026"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('products')}
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-full hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                Khám phá ngay
              </motion.button>
            </div>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Công nghệ tiên tiến', desc: 'Âm thanh và chất lượng đỉnh cao' },
              { icon: Award, title: 'Chất lượng cao cấp', desc: 'Vật liệu tuyển chọn từ khắp thế giới' },
              { icon: Heart, title: 'Thiết kế độc đáo', desc: 'Mỗi cây đàn là một tác phẩm nghệ thuật' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10"
              >
                <feature.icon className="w-12 h-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (page === '/landing/about') {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 text-center">
              Thương Hiệu
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Guitar NOVA
              </span>
            </h1>

            <div className="space-y-12">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-4">Câu chuyện của chúng tôi</h2>
                <p className="text-white/70 leading-relaxed mb-4">
                  Được thành lập từ năm 2016, Guitar NOVA đã trở thành một trong những cửa hàng guitar
                  hàng đầu tại Việt Nam. Với niềm đam mê âm nhạc và sự tận tâm với chất lượng,
                  chúng tôi mang đến cho khách hàng những sản phẩm guitar cao cấp nhất từ các thương hiệu
                  nổi tiếng trên thế giới.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Hơn 10 năm qua, chúng tôi đã phục vụ hàng nghìn guitarist từ người mới bắt đầu đến
                  chuyên nghiệp, giúp họ tìm được cây đàn hoàn hảo cho hành trình âm nhạc của mình.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { number: '10+', label: 'Năm kinh nghiệm' },
                  { number: '5000+', label: 'Khách hàng hài lòng' },
                  { number: '50+', label: 'Thương hiệu guitar' }
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 text-center"
                  >
                    <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </p>
                    <p className="text-white/60">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-semibold text-white mb-6">Giá trị cốt lõi</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { icon: Award, title: 'Chất lượng', desc: 'Cam kết mang đến sản phẩm chính hãng 100%' },
                    { icon: Heart, title: 'Đam mê', desc: 'Yêu âm nhạc và tận tâm với khách hàng' },
                    { icon: Users, title: 'Cộng đồng', desc: 'Xây dựng cộng đồng guitarist Việt Nam' },
                    { icon: Zap, title: 'Đổi mới', desc: 'Luôn cập nhật xu hướng và công nghệ mới' }
                  ].map((value, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <value.icon className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{value.title}</h3>
                        <p className="text-white/60 text-sm">{value.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default landing page
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </motion.button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Landing Page</h1>
          <p className="text-white/60">Chọn một landing page từ menu</p>
        </div>
      </div>
    </div>
  );
};
