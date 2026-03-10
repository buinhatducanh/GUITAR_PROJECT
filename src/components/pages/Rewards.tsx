import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Gift, Calendar, CheckCircle, X, Sparkles, Award } from 'lucide-react';
import { useApp, Voucher } from '@/app/context/AppContext';
import { toast } from 'sonner';
import { RewardsGridSkeleton } from '@/components/atoms/SkeletonLayouts';
import { useVouchers } from '@/hooks/useVouchers';
import { useNavigate } from 'react-router-dom';

interface RewardsProps {
  onBack?: () => void;
}

export const Rewards: React.FC<RewardsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, userVouchers, redeemVoucher } = useApp();
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [filter, setFilter] = useState<'all' | 'redeemed'>('all');

  const { data: vouchers = [], isLoading } = useVouchers();

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

  const handleRedeemVoucher = (voucher: Voucher) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đổi quà');
      return;
    }

    if (user.points < voucher.pointsCost) {
      toast.error('Không đủ điểm để đổi voucher này');
      return;
    }

    if (userVouchers.includes(voucher.id)) {
      toast.error('Bạn đã đổi voucher này rồi');
      return;
    }

    redeemVoucher(voucher.id);
    toast.success(`Đã đổi voucher ${voucher.title} thành công!`);
    setSelectedVoucher(null);
  };

  const filteredVouchers = filter === 'all'
    ? vouchers.filter(v => v.isActive)
    : vouchers.filter(v => userVouchers.includes(v.id));

  const getTierColor = () => {
    if (!user) return 'from-zinc-500 to-zinc-600';
    const points = user.points;
    if (points >= 5000) return 'from-purple-500 to-purple-600';
    if (points >= 2000) return 'from-amber-500 to-amber-600';
    if (points >= 1000) return 'from-blue-500 to-blue-600';
    return 'from-zinc-500 to-zinc-600';
  };

  const getTierName = () => {
    if (!user) return 'Bronze';
    const points = user.points;
    if (points >= 5000) return 'Platinum';
    if (points >= 2000) return 'Gold';
    if (points >= 1000) return 'Silver';
    return 'Bronze';
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <Helmet>
        <title>Đổi Quà Thưởng - Voucher | Guitar NOVA</title>
        <meta name="description" content="Sử dụng điểm thưởng để đổi voucher giảm giá hấp dẫn tại Guitar NOVA. Nhiều ưu đãi đặc biệt!" />
        <meta property="og:title" content="Đổi Quà Thưởng | Guitar NOVA" />
      </Helmet>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-b border-amber-500/20 mb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack || (() => navigate(-1))}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Đổi Quà Thưởng</h1>
              <p className="text-amber-300">Sử dụng điểm thưởng để đổi lấy voucher giảm giá</p>
            </div>

            {/* User Points Card */}
            {user && (
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
                  <Sparkles className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex items-baseline gap-2">
                  <Star className="w-8 h-8 text-white fill-white" />
                  <span className="text-4xl font-bold text-white">
                    {user.points.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-white/80 text-sm">điểm</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'all'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span>Tất cả voucher</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('redeemed')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'redeemed'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Đã đổi ({userVouchers.length})</span>
            </div>
          </motion.button>
        </div>

        {/* Vouchers Grid */}
        {!user ? (
          <div className="text-center py-20">
            <Gift className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60 mb-6">Vui lòng đăng nhập để xem và đổi voucher</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack || (() => navigate(-1))}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl"
            >
              Đăng nhập ngay
            </motion.button>
          </div>
        ) : isLoading ? (
          <RewardsGridSkeleton count={6} />
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60">
              {filter === 'all' ? 'Không có voucher nào khả dụng' : 'Bạn chưa đổi voucher nào'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVouchers.map((voucher, idx) => {
              const isRedeemed = userVouchers.includes(voucher.id);
              const canAfford = user && user.points >= voucher.pointsCost;
              const isExpired = new Date(voucher.expiryDate) < new Date();

              return (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border ${isRedeemed
                    ? 'border-green-500/50'
                    : canAfford && !isExpired
                      ? 'border-amber-500/30 hover:border-amber-500/60'
                      : 'border-white/10'
                    } transition-all cursor-pointer`}
                  onClick={() => setSelectedVoucher(voucher)}
                >
                  {/* Voucher Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={voucher.image}
                      alt={voucher.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {isRedeemed && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đã đổi
                      </div>
                    )}

                    {isExpired && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Hết hạn
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Voucher Code */}
                    <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-3">
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {voucher.code}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                      {voucher.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {voucher.description}
                    </p>

                    {/* Points Cost */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-xl font-bold text-amber-400">
                          {voucher.pointsCost.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-sm text-amber-300/60">điểm</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-xs text-white/50 mb-4">
                      {voucher.minPurchase > 0 && (
                        <p>• Đơn tối thiểu: {formatPrice(voucher.minPurchase)}</p>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>HSD: {formatDate(voucher.expiryDate)}</span>
                      </div>
                      <p>• Còn lại: {voucher.usageLimit - voucher.usedCount}/{voucher.usageLimit}</p>
                    </div>

                    {/* Redeem Button */}
                    {!isRedeemed && !isExpired && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRedeemVoucher(voucher);
                        }}
                        disabled={!canAfford}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/50'
                          : 'bg-white/5 text-white/30 cursor-not-allowed'
                          }`}
                      >
                        {canAfford ? 'Đổi ngay' : 'Không đủ điểm'}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voucher Detail Modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVoucher(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-48">
                <img
                  src={selectedVoucher.image}
                  alt={selectedVoucher.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-6">
                {/* Code */}
                <div className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg mb-4">
                  <span className="text-amber-400 font-mono font-bold text-lg">
                    {selectedVoucher.code}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  {selectedVoucher.title}
                </h2>
                <p className="text-white/60 mb-6">
                  {selectedVoucher.description}
                </p>

                {/* Voucher Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60">Chi phí điểm:</span>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="text-xl font-bold text-amber-400">
                        {selectedVoucher.pointsCost.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60">Giá trị giảm:</span>
                    <span className="text-white font-semibold">
                      {selectedVoucher.discountType === 'percentage'
                        ? `${selectedVoucher.discountValue}%`
                        : formatPrice(selectedVoucher.discountValue)}
                    </span>
                  </div>

                  {selectedVoucher.minPurchase > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/60">Đơn tối thiểu:</span>
                      <span className="text-white font-semibold">
                        {formatPrice(selectedVoucher.minPurchase)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white/60">Hạn sử dụng:</span>
                    <span className="text-white font-semibold">
                      {formatDate(selectedVoucher.expiryDate)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {user && !userVouchers.includes(selectedVoucher.id) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRedeemVoucher(selectedVoucher)}
                    disabled={user.points < selectedVoucher.pointsCost}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${user.points >= selectedVoucher.pointsCost
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/50'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                      }`}
                  >
                    {user.points >= selectedVoucher.pointsCost
                      ? 'Đổi voucher ngay'
                      : `Cần thêm ${(selectedVoucher.pointsCost - user.points).toLocaleString('vi-VN')} điểm`}
                  </motion.button>
                )}

                {userVouchers.includes(selectedVoucher.id) && (
                  <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">Bạn đã đổi voucher này</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
