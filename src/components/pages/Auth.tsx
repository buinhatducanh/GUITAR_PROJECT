import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, ArrowLeft, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthProps {
  mode: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuthStore();
  const settings = useSettingsStore((state) => state.settings);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        await googleLogin(tokenResponse.access_token);
        toast.success('Đăng nhập Google thành công!');
        navigate('/');
      } catch (error) {
        toast.error('Đăng nhập Google thất bại!');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error('Đăng nhập Google thất bại!'),
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleMode = () => {
    navigate(mode === 'login' ? '/register' : '/login', { replace: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhone(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam (VD: 0912345678)');
      return;
    }

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu không khớp!');
        return;
      }

      setIsLoading(true);
      try {
        await register(formData.name, formData.phone, formData.password);
        toast.success('Đăng ký thành công!');
        navigate('/');
      } catch {
        toast.error('Đăng ký thất bại! Số điện thoại có thể đã được sử dụng.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        await login(formData.phone, formData.password);
        toast.success('Đăng nhập thành công!');
        navigate('/');
      } catch {
        toast.error('Số điện thoại hoặc mật khẩu không đúng!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={handleBack}
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
                  ? `Chào mừng bạn quay lại ${settings?.siteName || 'Guitar NOVA'}`
                  : `Tạo tài khoản mới tại ${settings?.siteName || 'Guitar NOVA'}`}
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
                <label className="block text-white/80 mb-2">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                    placeholder="0912345678"
                  />
                </div>
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
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isLoading
                  ? 'Đang xử lý...'
                  : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </motion.button>
            </form>

            <div className="mt-8 mb-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-white/40" style={{ background: 'linear-gradient(to bottom right, #18181b, #09090b)' }}>Hoặc tiếp tục với</span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => loginWithGoogle()}
                  className="flex items-center justify-center gap-3 w-full py-3.5 bg-white hover:bg-gray-50 text-black font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {mode === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
                </button>
              </div>
            </div>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <p className="text-white/60">
                {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                {' '}
                <button
                  onClick={handleToggleMode}
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
