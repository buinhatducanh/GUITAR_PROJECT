import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCartStore } from '../../features/cart/store/cartStore';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart } = useApp();
  const { isOpen, setIsOpen } = useCartStore((state) => ({
    isOpen: state.isOpen,
    setIsOpen: state.setIsOpen,
  }));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 50000 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-950 border-l border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-white">Giỏ hàng</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-20 h-20 text-white/20 mb-4" />
                  <p className="text-xl text-white/60 mb-2">Giỏ hàng trống</p>
                  <p className="text-sm text-white/40">Thêm sản phẩm vào giỏ hàng để tiếp tục</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 bg-zinc-900/50 rounded-xl p-4 border border-white/5"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-1 line-clamp-2 text-sm">
                            {item.product.name}
                          </h3>
                          <p className="text-amber-500 font-bold mb-2">
                            {formatPrice(item.product.price)}
                          </p>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </motion.button>

                            <span className="w-8 text-center text-white font-medium">
                              {item.quantity}
                            </span>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </motion.button>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-start"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                    <span>Tổng cộng</span>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all"
                  >
                    Thanh toán
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                  >
                    Tiếp tục mua sắm
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
