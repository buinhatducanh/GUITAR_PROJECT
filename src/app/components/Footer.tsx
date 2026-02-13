import React from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-b from-black to-zinc-950 border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
              Guitar NOVA
            </h3>
            <p className="text-white/60 mb-4 leading-relaxed">
              Cửa hàng guitar cao cấp hàng đầu Việt Nam. Mang âm nhạc đến gần hơn với bạn.
            </p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 bg-white/5 hover:bg-amber-500/20 rounded-full flex items-center justify-center text-white/60 hover:text-amber-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 bg-white/5 hover:bg-amber-500/20 rounded-full flex items-center justify-center text-white/60 hover:text-amber-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="w-10 h-10 bg-white/5 hover:bg-amber-500/20 rounded-full flex items-center justify-center text-white/60 hover:text-amber-500 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              {['Về chúng tôi', 'Sản phẩm', 'Khuyến mãi', 'Liên hệ', 'Chính sách bảo hành'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/60 hover:text-amber-500 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận XYZ, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                <span>support@guitarnova.vn</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Đăng ký nhận tin</h4>
            <p className="text-white/60 mb-4 text-sm">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                <Mail className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Admin Access */}
        <div className="mb-8 pb-8 border-b border-white/10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Truy cập Admin Dashboard</span>
          </motion.button>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© 2026 Guitar NOVA. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-500 transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
