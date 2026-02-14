import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

// Demo accounts
const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@guitarNOVA.com',
    password: 'admin123',
    name: 'Admin Guitar NOVA',
    role: 'admin' as const
  },
  user: {
    email: 'user@gmail.com',
    password: 'user123',
    name: 'Nguyễn Văn A',
    role: 'user' as const
  }
};

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check admin account
    if (formData.email === DEMO_ACCOUNTS.admin.email && 
        formData.password === DEMO_ACCOUNTS.admin.password) {
      const adminUser = {
        id: 'admin-001',
        name: DEMO_ACCOUNTS.admin.name,
        email: DEMO_ACCOUNTS.admin.email,
        avatar: 'https://i.pravatar.cc/150?img=60',
        points: 99999,
        joinDate: '2024-01-01',
        totalOrders: 999,
        totalSpent: 999999999,
        lastLogin: new Date().toISOString(),
        role: 'admin' as const
      };
      setUser(adminUser);
      toast.success('Đăng nhập admin thành công!');
      navigate('/admin');
      return;
    }

    // Check user account
    if (formData.email === DEMO_ACCOUNTS.user.email && 
        formData.password === DEMO_ACCOUNTS.user.password) {
      const regularUser = {
        id: 'user-001',
        name: DEMO_ACCOUNTS.user.name,
        email: DEMO_ACCOUNTS.user.email,
        avatar: 'https://i.pravatar.cc/150?img=12',
        points: 2500,
        joinDate: '2025-06-15',
        totalOrders: 5,
        totalSpent: 25000000,
        lastLogin: new Date().toISOString(),
        role: 'user' as const
      };
      setUser(regularUser);
      toast.error('Bạn không có quyền truy cập Admin Dashboard');
      setTimeout(() => navigate('/'), 1500);
      return;
    }

    toast.error('Email hoặc mật khẩu không đúng!');
  };

  const handleDemoLogin = (accountType: 'admin' | 'user') => {
    const account = DEMO_ACCOUNTS[accountType];
    setFormData({
      email: account.email,
      password: account.password
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

            {/* Demo Accounts */}
            {showDemoAccounts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-purple-300 font-semibold text-sm">🔑 Tài khoản demo:</p>
                  <button
                    onClick={() => setShowDemoAccounts(false)}
                    className="text-purple-400 hover:text-purple-300 text-xs"
                  >
                    Ẩn
                  </button>
                </div>
                
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full p-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-lg text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">👑 Admin</p>
                        <p className="text-purple-300 text-xs">{DEMO_ACCOUNTS.admin.email}</p>
                      </div>
                      <span className="text-purple-400 text-xs">Click để điền</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin('user')}
                    className="w-full p-3 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/30 rounded-lg text-left transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">👤 User</p>
                        <p className="text-blue-300 text-xs">{DEMO_ACCOUNTS.user.email}</p>
                      </div>
                      <span className="text-blue-400 text-xs">Click để điền</span>
                    </div>
                  </motion.button>
                </div>

                <p className="text-purple-400/60 text-xs mt-3 text-center">
                  Mật khẩu mặc định: admin123 / user123
                </p>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="admin@guitarNOVA.com"
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
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all mt-6"
              >
                Đăng nhập
              </motion.button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 text-sm text-center">
                ⚠️ Đây là trang demo. Sử dụng tài khoản admin ở trên để truy cập.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
