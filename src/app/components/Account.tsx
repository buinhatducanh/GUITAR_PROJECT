import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Calendar, Star, ShoppingBag, Award, TrendingUp, Gift, Package, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useOrders } from '../hooks/useQueries';
import type { Order, OrderStatus } from '../../shared/types';

const STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  PROCESSING: { label: 'Đang xử lý', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' },
  SHIPPED: { label: 'Đang giao', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  DELIVERED: { label: 'Đã giao', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'vouchers'>('info');

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60">Vui lòng đăng nhập để xem thông tin tài khoản</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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

  const getTierColor = () => {
    const points = user.points;
    if (points >= 5000) return 'from-purple-500 to-purple-600';
    if (points >= 2000) return 'from-amber-500 to-amber-600';
    if (points >= 1000) return 'from-blue-500 to-blue-600';
    return 'from-zinc-500 to-zinc-600';
  };

  const getTierName = () => {
    const points = user.points;
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  const orderList = (orders || []) as Order[];
  const totalSpent = orderList
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-b border-purple-500/20 mb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-purple-500 bg-purple-900/50 flex items-center justify-center">
                <User className="w-10 h-10 text-purple-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-purple-300">{user.email}</p>
              </div>
            </div>

            {/* User Tier Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gradient-to-br ${getTierColor()} p-6 rounded-2xl border border-white/20 min-w-[280px]`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold">{getTierName()}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <Star className="w-8 h-8 text-white fill-white" />
                <span className="text-4xl font-bold text-white">
                  {(user.points || 0).toLocaleString('vi-VN')}
                </span>
                <span className="text-white/80 text-sm">điểm</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-6 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-blue-200 text-sm mb-1">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-white">{orderList.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-2xl p-6 border border-green-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-green-200 text-sm mb-1">Tổng chi tiêu</p>
            <p className="text-xl font-bold text-white">{formatPrice(totalSpent)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <Gift className="w-10 h-10 text-amber-400" />
            </div>
            <p className="text-amber-200 text-sm mb-1">Điểm tích lũy</p>
            <p className="text-3xl font-bold text-white">{(user.points || 0).toLocaleString('vi-VN')}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'info'
                ? 'text-purple-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Thông tin
            {activeTab === 'info' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'orders'
                ? 'text-purple-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Đơn hàng ({orderList.length})
            {activeTab === 'orders' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'vouchers'
                ? 'text-purple-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Voucher
            {activeTab === 'vouchers' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <User className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Họ và tên</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Ngày tham gia</p>
                  <p className="text-white font-medium">{user.joinDate ? formatDate(user.joinDate) : 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <Star className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white/60 text-sm">Hạng thành viên</p>
                  <p className="text-white font-medium">{getTierName()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {ordersLoading ? (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 text-center">
                <Loader2 className="w-10 h-10 text-purple-400 mx-auto mb-4 animate-spin" />
                <p className="text-white/60">Đang tải đơn hàng...</p>
              </div>
            ) : orderList.length === 0 ? (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 text-center">
                <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-white/60 mb-6">Bạn chưa mua sản phẩm nào từ Guitar NOVA</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/products')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl"
                >
                  Khám phá sản phẩm
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {orderList.map((order) => {
                  const status = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.005 }}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-6 border border-white/10 cursor-pointer hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-purple-400" />
                          <span className="text-amber-400 font-mono text-sm font-semibold">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-white/40" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(order.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">
                          {order.items.length} sản phẩm
                        </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                          {formatPrice(Number(order.totalAmount))}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'vouchers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl p-8 border border-white/10 text-center">
              <Gift className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">Chưa có voucher nào</h3>
              <p className="text-white/60 mb-6">Đổi điểm để nhận voucher giảm giá hấp dẫn</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/rewards')}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl"
              >
                Đổi voucher ngay
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
