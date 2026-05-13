import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Truck, Music, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent } from '@/components/atoms/card';

// --- Sub-components ---

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-amber-950/20" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_70%_30%,rgba(251,191,36,0.1),transparent_70%)]" />
    </div>

    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-amber-500 border-amber-500/20 bg-amber-500/10">
            Premium Collection 2026
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Nâng Tầm <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Âm Nhạc Của Bạn
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-xl leading-relaxed">
            Khám phá bộ sưu tập Guitar thủ công tinh xảo, được chế tác từ những loại gỗ quý hiếm nhất dành cho những nghệ sĩ thực thụ.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold h-14 text-lg">
              Sở Hữu Ngay <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-white/20 text-black hover:bg-black hover:text-white">
              <Play className="mr-2 w-5 h-5 fill-current" /> Xem Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full" />
          <img 
            src="https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=1000&auto=format&fit=crop" 
            alt="Premium Guitar"
            className="relative z-10 w-full max-w-lg mx-auto transform hover:rotate-3 transition-transform duration-500 drop-shadow-[0_20px_50px_rgba(251,191,36,0.3)]"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="bg-zinc-900/50 border-white/5 hover:border-amber-500/30 transition-colors group">
      <CardContent className="p-8">
        <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
          <Icon className="w-7 h-7 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-zinc-500 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export const SpecialPromo: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Hero Section */}
      <HeroSection />

      {/* Benefits Section */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tại Sao Chọn NOVA Guitar?</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Chúng tôi không chỉ bán đàn, chúng tôi mang đến một trải nghiệm âm nhạc hoàn hảo nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ShieldCheck} 
              title="Bảo Hành Trọn Đời" 
              description="Cam kết đồng hành cùng bạn trên mọi nốt nhạc với chế độ bảo dưỡng định kỳ miễn phí."
              delay={0.1}
            />
            <FeatureCard 
              icon={Music} 
              title="Âm Thanh Độc Bản" 
              description="Mỗi cây đàn đều được cân chỉnh riêng biệt để đạt được dải âm thanh cân bằng và truyền cảm nhất."
              delay={0.2}
            />
            <FeatureCard 
              icon={Truck} 
              title="Giao Hàng Siêu Tốc" 
              description="Miễn phí vận chuyển toàn quốc với quy trình đóng gói 5 lớp chống va đập tuyệt đối."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                Model X: <br />
                <span className="text-amber-500">The Artisan Ghost</span>
              </h2>
              <ul className="space-y-4 mb-10">
                {[
                  "Mặt đàn bằng gỗ Thông Spruce nguyên tấm loại AAAA",
                  "Lưng và hông gỗ Cẩm Ấn Độ (Indian Rosewood)",
                  "Hệ thống EQ Fishman cao cấp tích hợp",
                  "Khóa đàn Gotoh mạ vàng 18K"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-300">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-bold text-white">15.900.000đ</span>
                <span className="text-xl text-zinc-600 line-through">19.500.000đ</span>
              </div>
              <Button className="w-full md:w-auto px-12 py-7 h-auto rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold text-xl">
                Đặt Hàng Ngay
              </Button>
            </div>
            <div className="lg:w-1/2">
               <img 
                src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1000&auto=format&fit=crop" 
                alt="Artisan Ghost"
                className="rounded-2xl shadow-2xl shadow-amber-500/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials or Stats */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Nghệ sĩ tin dùng", value: "500+" },
              { label: "Sản phẩm bán ra", value: "10,000+" },
              { label: "Điểm đánh giá", value: "4.9/5" },
              { label: "Năm kinh nghiệm", value: "15+" },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">{stat.value}</p>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-amber-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">Sẵn Sàng Cho Bản Nhạc Đầu Tiên?</h2>
          <p className="text-black/70 mb-12 max-w-2xl mx-auto text-xl">
            Tham gia cộng đồng NOVA Guitar ngay hôm nay và nhận ưu đãi giảm giá 10% cho đơn hàng đầu tiên của bạn.
          </p>
          <Button variant="outline" className="px-12 py-8 h-auto rounded-full border-black text-black hover:bg-black hover:text-white transition-all text-xl font-bold">
            Đăng Ký Thành Viên
          </Button>
        </div>
      </section>
    </div>
  );
};
