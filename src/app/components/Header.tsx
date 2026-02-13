import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User, LogOut, Settings, Menu, X, Star, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCartStore } from '../../features/cart/store/cartStore';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, cart } = useApp();
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setUser(null);
    setIsUserMenuOpen(false);
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Guitar NOVA
            </h1>
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
            <div className="relative">
              {user ? (
                <div className="flex items-center gap-3">
                  {/* Points Display next to avatar */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full"
                  >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">
                      {user.points.toLocaleString('vi-VN')}
                    </span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-medium"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-white/60 mb-3">{user.email}</p>
                          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-amber-400">
                              {user.points.toLocaleString('vi-VN')} điểm
                            </span>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              navigate('/rewards');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Gift className="w-4 h-4" />
                            <span>Đổi quà thưởng</span>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/account');
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Quản lý tài khoản</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                          </button>
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