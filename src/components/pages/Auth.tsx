import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, ArrowLeft, Phone, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { toast } from 'sonner';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthProps {
  mode: 'login' | 'register';
}

interface FieldErrors {
  name?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const FieldError: React.FC<{ message?: string }> = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -4, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -4, height: 0 }}
        className="flex items-center gap-1.5 mt-1.5 text-red-400 text-sm"
      >
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error('Đăng nhập Google thất bại!');
      return;
    }
    try {
      setIsLoading(true);
      await googleLogin(credentialResponse.credential);
      toast.success('Đăng nhập Google thành công!');
      navigate('/');
    } catch (error) {
      toast.error('Đăng nhập Google thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleMode = () => {
    setErrors({});
    navigate(mode === 'login' ? '/register' : '/login', { replace: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user types
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[3|5|7|8|9])\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (mode === 'register') {
      // Name validation
      if (!formData.name.trim()) {
        newErrors.name = 'Vui lòng nhập họ và tên';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
      }

      // Confirm password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(formData.name, formData.phone, formData.password);
        toast.success('Đăng ký thành công!');
      } else {
        await login(formData.phone, formData.password);
        toast.success('Đăng nhập thành công!');
      }
      navigate('/');
    } catch (error: any) {
      const msg = error?.message || '';

      if (mode === 'login') {
        // Map backend errors to inline field errors
        if (msg.includes('mật khẩu không đúng') || msg.includes('điện thoại')) {
          setErrors({ phone: ' ', password: 'Số điện thoại hoặc mật khẩu không đúng' });
        } else {
          toast.error(msg || 'Đăng nhập thất bại!');
        }
      } else {
        if (msg.includes('đã được sử dụng')) {
          setErrors({ phone: 'Số điện thoại này đã được đăng ký' });
        } else if (msg.includes('điền đầy đủ')) {
          toast.error('Vui lòng điền đầy đủ thông tin!');
        } else {
          toast.error(msg || 'Đăng ký thất bại!');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-3 bg-black/30 border rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-colors ${errors[field]?.trim()
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-white/10 focus:border-amber-500/50'
    }`;

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
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'register' && (
                <div>
                  <label className="block text-white/80 mb-2">Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass('name')}
                    placeholder="Nguyễn Văn A"
                  />
                  <FieldError message={errors.name} />
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
                    className={`${inputClass('phone')} !pl-12`}
                    placeholder="0912345678"
                  />
                </div>
                <FieldError message={errors.phone?.trim() ? errors.phone : undefined} />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass('password')}
                  placeholder="••••••••"
                />
                <FieldError message={errors.password} />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-white/80 mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass('confirmPassword')}
                    placeholder="••••••••"
                  />
                  <FieldError message={errors.confirmPassword} />
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Đăng nhập Google thất bại. Vui lòng thử lại!')}
                  theme="outline"
                  size="large"
                  width="100%"
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                  shape="pill"
                />
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
