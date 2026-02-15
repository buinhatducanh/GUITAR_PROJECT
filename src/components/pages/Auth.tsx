import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';

interface AuthProps {
  mode: 'login' | 'register';
  onBack: () => void;
  onToggleMode: () => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onBack, onToggleMode }) => {
  const { setUser } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu không khớp!');
        return;
      }

      // Simulate registration
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
        points: 100,
        joinDate: new Date().toISOString(),
        totalOrders: 0,
        totalSpent: 0,
        lastLogin: new Date().toISOString(),
        role: 'user' as const
      };
      setUser(newUser);
      toast.success('Đăng ký thành công! Bạn nhận được 100 điểm tân thủ 🎉');
      onBack();
    } else {
      // Simulate login
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.email.split('@')[0],
        email: formData.email,
        avatar: `https://i.pravatar.cc/150?u=${formData.email}`,
        points: 2500,
        joinDate: '2025-06-15',
        totalOrders: 5,
        totalSpent: 25000000,
        lastLogin: new Date().toISOString(),
        role: 'user' as const
      };
      setUser(user);
      toast.success('Đăng nhập thành công!');
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                {mode === 'login' ? (
                  <LogIn className="w-8 h-8 text-white" />
                ) : (
                  <UserPlus className="w-8 h-8 text-white" />
                )}
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </h1>
              <p className="text-white/60">
                {mode === 'login' 
                  ? 'Chào mừng bạn quay lại Guitar NOVA' 
                  : 'Tạo tài khoản mới tại Guitar NOVA'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-white/80 mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              )}

              <div>
                <label className="block text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-white/80 mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all"
              >
                {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-white/60">
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                {' '}
                <button
                  onClick={onToggleMode}
                  className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
