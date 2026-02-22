import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, LogOut, Settings, Menu, X, Star, Gift, LayoutDashboard, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/app/context/AppContext';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useApp();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);
  const settings = useSettingsStore((state) => state.settings);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Sản phẩm', path: '/products' },
    { label: 'Danh mục', path: '/categories' },
    { label: 'Khuyến mãi', path: '/promo' },
    { label: 'Sự kiện', path: '/events' },
    { label: 'Đổi quà', path: '/rewards' },
    { label: 'Blog', path: '/blog' }
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
            onClick={() => navigate('/')}
          >
            {settings?.logo ? (
              <img src={settings.logo} alt={settings.siteName || 'Logo'} className="h-8 md:h-10 object-contain" />
            ) : (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                {settings?.siteName || 'Guitar NOVA'}
              </h1>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-amber-400' : 'text-white/80 hover:text-white'
                  }`}
                whileHover={{ y: -2 }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Badge: điểm cho user thường, Admin badge cho admin */}
                  {isAdmin ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/40 rounded-full"
                    >
                      <Shield className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-semibold text-violet-400 tracking-wide">ADMIN</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full"
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">
                        {user.points.toLocaleString('vi-VN')}
                      </span>
                    </motion.div>
                  )}

                  {/* Avatar button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${isAdmin
                        ? 'bg-gradient-to-br from-violet-500 to-purple-700 ring-2 ring-violet-500/50'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600'
                      }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-60 bg-zinc-900/98 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                        style={{ maxWidth: 'calc(100vw - 16px)' }}
                      >
                        {/* Header info */}
                        <div className={`p-4 border-b border-white/10 ${isAdmin ? 'bg-gradient-to-br from-violet-500/10 to-purple-500/5' : ''}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            {isAdmin && (
                              <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-violet-500/20 border border-violet-500/40 rounded text-violet-400 text-xs font-bold">
                                <Shield className="w-3 h-3" />
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/50 truncate">{user.phone || user.email}</p>
                          {/* Chỉ hiện điểm cho user thường */}
                          {!isAdmin && (
                            <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/25 rounded-lg">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-amber-400">
                                {user.points.toLocaleString('vi-VN')} điểm
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Menu items */}
                        <div className="p-2">
                          {isAdmin ? (
                            <>
                              <button
                                onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-violet-300 hover:text-white hover:bg-violet-500/15 rounded-lg transition-colors font-medium"
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>Trang quản trị</span>
                              </button>
                              <button
                                onClick={() => { navigate('/account'); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                <span>Thông tin tài khoản</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => { navigate('/rewards'); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                              >
                                <Gift className="w-4 h-4" />
                                <span>Đổi quà thưởng</span>
                              </button>
                              <button
                                onClick={() => { navigate('/account'); setIsUserMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                <span>Quản lý tài khoản</span>
                              </button>
                            </>
                          )}
                          <div className="mt-1 pt-1 border-t border-white/5">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Đăng xuất</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <User className="w-6 h-6" />
                </motion.button>
              )}
            </div>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/80 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pt-4 border-t border-white/10"
            >
              {navItems.map((item) => (
                <motion.button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${location.pathname === item.path
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};