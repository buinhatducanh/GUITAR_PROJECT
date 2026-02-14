import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../features/cart/store/cartStore';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useCreateOrder } from '../hooks/useQueries';
import { toast } from 'sonner';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items: cart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'cod'
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 10000000 ? 0 : 50000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }

    const fullAddress = `${formData.address}, ${formData.city}`;

    try {
      const order = await createOrder.mutateAsync({
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        address: fullAddress,
        phone: formData.phone,
        notes: formData.notes || undefined,
        totalAmount: total,
      });

      setOrderNumber(order.orderNumber);
      setIsSuccess(true);
      toast.success('Đặt hàng thành công!');

      // Wait for animation then clear cart and redirect
      setTimeout(() => {
        clearCart();
        navigate('/account');
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Giỏ hàng trống</h2>
          <p className="text-white/60 mb-6">Bạn cần thêm sản phẩm vào giỏ trước khi thanh toán.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl"
          >
            Khám phá sản phẩm
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Back Button */}
      <div className="container mx-auto px-4 mb-8">
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại giỏ hàng</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Thanh toán
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Thông tin giao hàng</h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

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
                    <label className="block text-white/80 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="0123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2">Thành phố</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="Hà Nội"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 mb-2">Địa chỉ</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                      placeholder="Số nhà, tên đường, phường/xã"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 mb-2">Ghi chú (tùy chọn)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                      placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-white mb-6">Phương thức thanh toán</h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500"
                    />
                    <span className="text-white">Thanh toán khi nhận hàng (COD)</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500"
                    />
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <span className="text-white">Thẻ tín dụng / Thẻ ghi nợ</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500"
                    />
                    <span className="text-white">Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createOrder.isPending}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createOrder.isPending ? 'Đang xử lý...' : `Thanh toán ${formatPrice(total)}`}
              </motion.button>

              {createOrder.isError && (
                <p className="text-red-400 text-sm text-center">
                  {(createOrder.error as Error)?.message || 'Đã xảy ra lỗi'}
                </p>
              )}
            </motion.form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 sticky top-24"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">Đơn hàng</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm line-clamp-2 mb-1">{item.product.name}</p>
                      <p className="text-white/60 text-sm">x{item.quantity}</p>
                    </div>
                    <p className="text-amber-500 font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-6 border-y border-white/10">
                <div className="flex justify-between text-white/60">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? <span className="text-green-400">Miễn phí</span> : formatPrice(shipping)}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-green-400/60 text-xs">Miễn phí ship cho đơn từ 10 triệu</p>
                )}
              </div>

              <div className="flex justify-between text-2xl font-bold text-white mt-6">
                <span>Tổng cộng</span>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {formatPrice(total)}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-12 max-w-md text-center border border-white/10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-4">Đặt hàng thành công!</h2>
              <p className="text-white/60 mb-2">Cảm ơn bạn đã mua hàng tại Guitar NOVA</p>
              {orderNumber && (
                <p className="text-amber-400 font-mono text-sm mb-2">
                  Mã đơn hàng: {orderNumber}
                </p>
              )}
              <p className="text-white/40 text-sm">Đang chuyển đến trang tài khoản...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
