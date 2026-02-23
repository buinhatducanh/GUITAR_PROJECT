import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CreditCard, CheckCircle2, Phone, MapPin, Store, Hash, Ticket, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/context/AppContext';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { ordersApi, vouchersApi } from '@/app/lib/api';
import { toast } from 'sonner';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, user, clearCart } = useApp();
  const settings = useSettingsStore((state) => state.settings);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    paymentMethod: 'cod',
    deliveryMethod: 'delivery' // 'delivery' | 'pickup'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number; message: string } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const isPickup = formData.deliveryMethod === 'pickup';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // Phí ship = 0 nếu nhận tại cửa hàng, còn giao hàng sẽ do nhân viên xác nhận qua SĐT
  const shipping = isPickup ? 0 : null;
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const total = Math.max(0, subtotal + (shipping ?? 0) - discountAmount);

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

    setIsProcessing(true);

    // Save order to database
    try {
      const address = isPickup
        ? `Nhận tại cửa hàng`
        : `${formData.address}, ${formData.city}`;

      const orderItems = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const methodLabel = formData.paymentMethod === 'cod'
        ? 'COD' : formData.paymentMethod === 'card'
          ? 'Thẻ tín dụng' : 'Chuyển khoản';

      const notes = `Thanh toán: ${methodLabel}. Họ tên: ${formData.fullName}`;

      const result = user
        ? await ordersApi.create({
          items: orderItems,
          address,
          phone: formData.phone,
          notes,
          totalAmount: total,
          voucherCode: appliedVoucher?.code,
        })
        : await ordersApi.createGuest({
          guestName: formData.fullName,
          phone: formData.phone,
          items: orderItems,
          address,
          notes,
          totalAmount: total,
          voucherCode: appliedVoucher?.code,
        });

      setOrderNumber(result.orderNumber);
    } catch (err) {
      console.error('Failed to create order:', err);
      // Continue to show success modal — staff will confirm via phone
    }

    setIsProcessing(false);
    setIsSuccess(true);

    // Wait for animation then redirect
    setTimeout(() => {
      clearCart();
      navigate('/');
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleValidateVoucher = async () => {
    if (!voucherInput.trim()) {
      setVoucherError('Vui lòng nhập mã');
      return;
    }
    setIsValidatingVoucher(true);
    setVoucherError('');
    try {
      const res = await vouchersApi.validate(voucherInput.trim(), subtotal);
      if (res.valid) {
        setAppliedVoucher({
          code: voucherInput.trim(),
          discountAmount: res.discountAmount,
          message: res.message
        });
        toast.success(res.message);
      } else {
        setVoucherError(res.message || 'Mã không hợp lệ');
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Mã không hợp lệ');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  // Redirect if cart is empty and not showing success
  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-xl mb-4">Giỏ hàng trống</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl"
          >
            Tiếp tục mua sắm
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
                <h2 className="text-2xl font-semibold text-white mb-6">Phương thức nhận hàng</h2>

                {/* Delivery method selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.deliveryMethod === 'delivery'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-black/30 hover:border-white/30'
                      }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={formData.deliveryMethod === 'delivery'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500"
                    />
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm">Giao hàng tận nơi</p>
                      <p className="text-white/40 text-xs">Nhân viên xác nhận phí sau</p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.deliveryMethod === 'pickup'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-white/10 bg-black/30 hover:border-white/30'
                      }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === 'pickup'}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500"
                    />
                    <Store className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm">Nhận tại cửa hàng</p>
                      <p className="text-green-400 text-xs font-medium">Miễn phí vận chuyển</p>
                    </div>
                  </label>
                </div>

                {/* Store address info when pickup */}
                {isPickup && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
                  >
                    <p className="text-green-400 font-medium text-sm mb-1">Địa chỉ cửa hàng {settings?.siteName || 'Guitar NOVA'}</p>
                    <p className="text-white/70 text-sm">{settings?.address || '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'}</p>
                    <p className="text-white/50 text-xs mt-1">Giờ mở cửa: {settings?.businessHours || '8:00 – 21:00 hàng ngày'}</p>
                  </motion.div>
                )}

                {/* Shipping info when delivery */}
                {!isPickup && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                  >
                    <p className="text-amber-400 font-medium text-sm mb-1">Phí vận chuyển</p>
                    <p className="text-white/70 text-sm">
                      {settings?.shippingInfo || `Nhân viên ${settings?.siteName || 'Guitar NOVA'} sẽ liên hệ qua SĐT để xác nhận phí ship dựa trên khoảng cách từ cửa hàng tới địa chỉ của bạn.`}
                    </p>
                  </motion.div>
                )}

                <h2 className="text-2xl font-semibold text-white mb-6">Thông tin liên hệ</h2>

                {!user && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-white/60 text-sm">
                      Bạn chưa đăng nhập. Tài khoản sẽ được tạo tự động khi đặt hàng với số điện thoại của bạn.
                    </p>
                  </div>
                )}

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
                    <label className="block text-white/80 mb-2">Số điện thoại <span className="text-amber-500">*</span></label>
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

                  {/* Address fields only shown for delivery */}
                  {!isPickup && (
                    <>
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
                        <label className="block text-white/80 mb-2">Địa chỉ giao hàng</label>
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
                    </>
                  )}
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
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? 'Đang xử lý...'
                  : isPickup
                    ? `Đặt hàng — ${formatPrice(total)}`
                    : `Đặt hàng — ${formatPrice(total)} + phí ship`}
              </motion.button>
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

              {/* Voucher Section */}
              <div className="py-6 border-y border-white/10 mb-6">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  Mã giảm giá
                </h3>

                {!appliedVoucher ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        placeholder="Nhập mã voucher / sự kiện"
                        className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50 uppercase"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleValidateVoucher())}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleValidateVoucher}
                        disabled={isValidatingVoucher || !voucherInput.trim()}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingVoucher ? 'Đang kiểm tra...' : 'Áp dụng'}
                      </motion.button>
                    </div>
                    {voucherError && (
                      <p className="text-red-400 text-sm">{voucherError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-green-400 font-bold font-mono">{appliedVoucher.code}</p>
                      <p className="text-white/70 text-sm">{appliedVoucher.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 py-6 border-b border-white/10 mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Phí vận chuyển</span>
                  {isPickup ? (
                    <span className="text-green-400 font-medium">Miễn phí</span>
                  ) : (
                    <span className="text-amber-400/80 text-sm italic">Xác nhận sau qua SĐT</span>
                  )}
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-400 font-medium">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(appliedVoucher.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-2xl font-bold text-white mt-6">
                <span>{isPickup ? 'Tổng cộng' : 'Tạm tính'}</span>
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {formatPrice(total)}
                </span>
              </div>
              {!isPickup && (
                <p className="text-white/40 text-xs mt-2">* Tổng cuối cùng chưa bao gồm phí vận chuyển</p>
              )}
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
              {orderNumber && (
                <div className="flex items-center justify-center gap-2 mb-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <Hash className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-mono font-bold">{orderNumber}</span>
                </div>
              )}
              <p className="text-white/60 mb-2">Cảm ơn bạn đã mua hàng tại {settings?.siteName || 'Guitar NOVA'}</p>
              <p className="text-white/60 mb-2">Chúng tôi sẽ liên hệ qua SĐT: <span className="text-amber-400 font-medium">{formData.phone}</span></p>
              <p className="text-white/40 text-sm">Đơn hàng của bạn đang được xử lý...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
