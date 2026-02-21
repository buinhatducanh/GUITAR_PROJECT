import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.phone, formData.password);

      // Check if user is admin after login
      const user = useAuthStore.getState().user;
      if (user?.role !== 'ADMIN') {
        useAuthStore.getState().logout();
        toast.error('Bạn không có quyền truy cập Admin Dashboard');
        return;
      }

      toast.success('Đăng nhập admin thành công!');
      navigate('/admin');
    } catch {
      toast.error('Số điện thoại hoặc mật khẩu không đúng!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({
      phone: '0378443602',
      password: 'ducanhnhatbui123'
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/')}
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
            className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-8 border border-purple-500/30"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-purple-300">
                Đăng nhập để quản lý hệ thống
              </p>
            </div>

            {/* Demo Account Quick Fill */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-purple-300 font-semibold text-sm">🔑 Tài khoản admin:</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFillDemo}
                className="w-full p-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-lg text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">👑 Admin</p>
                    <p className="text-purple-300 text-xs">SĐT: 0378443602</p>
                  </div>
                  <span className="text-purple-400 text-xs">Click để điền</span>
                </div>
              </motion.button>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="0378443602"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all mt-6 disabled:opacity-50"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
