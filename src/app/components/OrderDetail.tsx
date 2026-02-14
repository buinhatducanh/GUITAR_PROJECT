import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Package, Clock, MapPin, Phone, FileText, Loader2, CheckCircle2, Truck, Box, XCircle, ClipboardCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useQueries';
import type { OrderStatus } from '../../shared/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-400', icon: <Clock className="w-5 h-5" />, step: 0 },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-400', icon: <ClipboardCheck className="w-5 h-5" />, step: 1 },
  PROCESSING: { label: 'Đang xử lý', color: 'text-purple-400', icon: <Box className="w-5 h-5" />, step: 2 },
  SHIPPED: { label: 'Đang giao hàng', color: 'text-orange-400', icon: <Truck className="w-5 h-5" />, step: 3 },
  DELIVERED: { label: 'Đã giao hàng', color: 'text-green-400', icon: <CheckCircle2 className="w-5 h-5" />, step: 4 },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-400', icon: <XCircle className="w-5 h-5" />, step: -1 },
};

const PROGRESS_STEPS = [
  { key: 'PENDING', label: 'Chờ xác nhận' },
  { key: 'CONFIRMED', label: 'Xác nhận' },
  { key: 'PROCESSING', label: 'Xử lý' },
  { key: 'SHIPPED', label: 'Giao hàng' },
  { key: 'DELIVERED', label: 'Hoàn thành' },
] as const;

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id || '');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy đơn hàng</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/account')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl"
          >
            Về tài khoản
          </motion.button>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status as OrderStatus] || STATUS_CONFIG.PENDING;
  const currentStep = status.step;
  const isCancelled = order.status === 'CANCELLED';
  const itemsTotal = order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);
  const shippingFee = Number(order.totalAmount) - itemsTotal;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/account')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại tài khoản</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Chi tiết đơn hàng</h1>
            <p className="text-amber-400 font-mono">{order.orderNumber}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${status.color} bg-white/5 border-current`}>
            {status.icon}
            <span className="font-semibold">{status.label}</span>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 mb-8"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Trạng thái đơn hàng</h2>
            <div className="flex items-center justify-between relative">
              {/* Progress line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
              <div
                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${Math.max(0, (currentStep / (PROGRESS_STEPS.length - 1)) * 100)}%` }}
              />

              {PROGRESS_STEPS.map((step, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? 'bg-amber-500 border-amber-500 text-white scale-110'
                        : isActive
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-zinc-800 border-white/20 text-white/40'
                    }`}>
                      {isActive && idx < currentStep ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-white' : 'text-white/40'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8 flex items-center gap-4"
          >
            <XCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Đơn hàng đã bị hủy</p>
              <p className="text-red-400/60 text-sm">Đơn hàng này đã được hủy và không còn hiệu lực.</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Sản phẩm ({order.items.length})</h2>

              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1 line-clamp-2">{item.name}</p>
                      <p className="text-white/50 text-sm">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-amber-400 font-semibold">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                      <p className="text-white/40 text-sm">
                        {formatPrice(Number(item.price))} / sp
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Price summary */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Tổng thanh toán</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-white/60">
                  <span>Tạm tính</span>
                  <span>{formatPrice(itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Phí vận chuyển</span>
                  <span>{shippingFee <= 0 ? <span className="text-green-400">Miễn phí</span> : formatPrice(shippingFee)}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Tổng cộng</span>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      {formatPrice(Number(order.totalAmount))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping info */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Thông tin giao hàng</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-white/70 text-sm">{order.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-white/70 text-sm">{order.phone}</p>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-purple-400 mt-1 flex-shrink-0" />
                    <p className="text-white/70 text-sm">{order.notes}</p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-white/70 text-sm">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
