import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Calendar, Gift, Star, Heart, Users, Trophy, Sparkles, CheckCircle2, Clock, Copy, Check, History } from 'lucide-react';
import { useApp, Event } from '@/app/context/AppContext';
import { toast } from 'sonner';
import { EventsListSkeleton } from '@/components/atoms/SkeletonLayouts';
import { useEvents } from '@/hooks/useEvents';
import { eventsApi } from '@/app/lib/api';

interface EventsProps {
  onBack?: () => void;
}

export const Events: React.FC<EventsProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, userEventStatuses, setUserEventStatuses, addPoints } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filter, setFilter] = useState<'active' | 'upcoming' | 'past' | 'history'>('active');
  const [processingEventId, setProcessingEventId] = useState<string | null>(null);
  const [rewardClaimed, setRewardClaimed] = useState<{ type: string; code?: string; value?: number; title?: string } | null>(null);

  const { data: events = [], isLoading, refetch: refetchEvents } = useEvents();

  const fetchUserStatuses = async () => {
    if (!user) return;
    try {
      const statuses = await eventsApi.getMyStatus();
      setUserEventStatuses(statuses);
    } catch (err) {
      console.error('Fetch user statuses error:', err);
    }
  };

  useEffect(() => {
    fetchUserStatuses();
  }, [user]);

  const getEventStatus = (eventId: string) => {
    return userEventStatuses.find(s => s.eventId === eventId);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login_streak':
        return Calendar;
      case 'purchase_couple':
        return Heart;
      case 'special_day':
        return Sparkles;
      case 'first_purchase':
        return Gift;
      case 'referral':
        return Users;
      default:
        return Trophy;
    }
  };

  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'login_streak':
        return 'from-blue-500 to-blue-600';
      case 'purchase_couple':
        return 'from-pink-500 to-rose-600';
      case 'special_day':
        return 'from-purple-500 to-purple-600';
      case 'first_purchase':
        return 'from-green-500 to-green-600';
      case 'referral':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-zinc-500 to-zinc-600';
    }
  };

  const isEventActive = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end && event.isActive;
  };

  const isEventUpcoming = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    return now < start;
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'history') {
      const status = getEventStatus(event.id);
      return status?.rewardClaimed;
    }
    if (filter === 'active') return isEventActive(event);
    if (filter === 'upcoming') return isEventUpcoming(event);
    if (filter === 'past') return !isEventActive(event) && !isEventUpcoming(event);
    return true;
  });

  const handleAction = async (event: Event) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tham gia sự kiện');
      return;
    }

    const status = getEventStatus(event.id);
    const eventType = event.type.toLowerCase();

    // 1. Social/Action events that don't require server check-in if not joined (Special case for referral)
    if (!status && eventType === 'referral') {
      const shareData = {
        title: event.title,
        text: event.description,
        url: window.location.href,
      };

      if (navigator.share) {
        navigator.share(shareData)
          .then(() => toast.success('Đã chia sẻ thành công!'))
          .catch(() => toast.error('Lỗi khi chia sẻ'));
      } else {
        navigator.clipboard.writeText(`${event.title}: ${event.description} - ${window.location.href}`)
          .then(() => toast.success(' Đã sao chép link giới thiệu vào bộ nhớ tạm!'))
          .catch(() => toast.error('Không thể sao chép link'));
      }
      return;
    }

    setProcessingEventId(event.id);
    try {
      let currentStatus = status;

      if (!currentStatus) {
        // Tham gia
        const joinRes = await eventsApi.join(event.id);
        toast.success(`Bạn đã tham gia sự kiện: ${event.title}`);

        // Refresh local status reference from API response
        currentStatus = joinRes;
      }

      // Check if we can claim reward immediately (One-click reward)
      if (currentStatus && currentStatus.completed && !currentStatus.rewardClaimed) {
        // Nhận quà
        const res = await eventsApi.claimReward(event.id);
        toast.success(res.message || 'Nhận thưởng thành công!');

        // Refresh statuses to get the rewardCode/rewardValue in history
        await fetchUserStatuses();

        if (res.rewardDetails) {
          setRewardClaimed({
            ...res.rewardDetails,
            title: event.title
          });
        }

        // Update points if reward was points
        if (event.reward?.type === 'points') {
          addPoints(event.reward.value);
        }
      } else if (currentStatus && !currentStatus.completed) {
        // Hành động cho từng loại sự kiện khi chưa hoàn thành
        switch (eventType) {
          case 'first_purchase':
          case 'purchase_couple':
            navigate('/products');
            setSelectedEvent(null);
            return;
          case 'referral':
            // Xử lý chia sẻ lại nếu cần (đã xử lý ở trên nhưng đề phòng trường hợp đã join)
            break;
          case 'login_streak':
          case 'special_day':
          default:
            // Điểm danh cho các sự kiện tích lũy
            const isToday = currentStatus.lastCheckIn && new Date(currentStatus.lastCheckIn).toDateString() === new Date().toDateString();
            if (isToday) {
              toast.info('Bạn đã điểm danh hôm nay rồi');
              return;
            }
            await eventsApi.checkin(event.id);
            toast.success('Điểm danh thành công!');
            break;
        }
      }

      // Refresh user statuses
      await fetchUserStatuses();
      setSelectedEvent(null);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setProcessingEventId(null);
    }
  };

  const getEventActionButtonLabel = (event: Event) => {
    const status = getEventStatus(event.id);
    const eventType = event.type.toLowerCase();

    if (!status) {
      if (eventType === 'purchase_couple' || eventType === 'first_purchase') return 'Mua ngay';
      if (eventType === 'referral') return 'Chia sẻ';
      return 'Tham gia ngay';
    }

    if (status.rewardClaimed) return 'Đã nhận thưởng';
    if (status.completed) return 'Nhận thưởng';

    // Incomplete states
    switch (eventType) {
      case 'first_purchase':
      case 'purchase_couple':
        return 'Mua ngay';
      case 'referral':
        return 'Chia sẻ';
      default:
        const isToday = status.lastCheckIn && new Date(status.lastCheckIn).toDateString() === new Date().toDateString();
        return isToday ? 'Đã điểm danh' : 'Điểm danh';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-purple-500/20 mb-8">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack || (() => navigate(-1))}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </motion.button>

          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Sự Kiện & Nhiệm Vụ</h1>
          </div>
          <p className="text-purple-300">
            Tham gia sự kiện và hoàn thành nhiệm vụ để nhận điểm thưởng hấp dẫn
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'active'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Đang diễn ra</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'upcoming'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Sắp diễn ra</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('past')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'past'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Đã kết thúc</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filter === 'history'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <span>Lịch sử nhận quà</span>
            </div>
          </motion.button>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <EventsListSkeleton count={6} />
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <p className="text-xl text-white/60">
              {filter === 'active' && 'Không có sự kiện nào đang diễn ra'}
              {filter === 'upcoming' && 'Không có sự kiện nào sắp diễn ra'}
              {filter === 'past' && 'Không có sự kiện nào đã kết thúc'}
              {filter === 'history' && 'Bạn chưa nhận phần thưởng từ sự kiện nào'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, idx) => {
              const EventIcon = getEventIcon(event.type);
              const eventColor = getEventColor(event.type);
              const isActive = isEventActive(event);
              const isUpcoming = isEventUpcoming(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-2xl overflow-hidden border ${isActive
                    ? 'border-purple-500/50 hover:border-purple-500/80'
                    : 'border-white/10 hover:border-white/20'
                    } transition-all cursor-pointer`}
                  onClick={() => setSelectedEvent(event)}
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Status Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${isActive
                        ? 'bg-green-500 text-white'
                        : isUpcoming
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-500 text-white'
                        }`}
                    >
                      {isActive && <CheckCircle2 className="w-4 h-4" />}
                      {isUpcoming && <Clock className="w-4 h-4" />}
                      {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                    </div>

                    {/* Icon Overlay */}
                    <div className={`absolute bottom-4 left-4 p-3 bg-gradient-to-br ${eventColor} rounded-xl`}>
                      <EventIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Reward */}
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg mb-4">
                      {filter === 'history' ? (
                        getEventStatus(event.id)?.rewardCode ? (
                          <div className="flex flex-col w-full gap-2 py-1">
                            <div className="flex items-center justify-between text-purple-400 font-bold">
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                <span className="text-xs">Mã của bạn:</span>
                              </div>
                              <span className="text-base tracking-wider select-all px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                                {getEventStatus(event.id)?.rewardCode}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const code = getEventStatus(event.id)?.rewardCode;
                                if (code) {
                                  navigator.clipboard.writeText(code);
                                  toast.success('Đã sao chép mã voucher!');
                                }
                              }}
                              className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] rounded flex items-center justify-center gap-2 transition-colors border border-purple-500/10"
                            >
                              <Copy className="w-3 h-3" />
                              Sao chép mã
                            </button>
                          </div>
                        ) : getEventStatus(event.id)?.rewardValue ? (
                          <div className="flex items-center gap-2 text-amber-400 font-bold">
                            <Star className="w-5 h-5 fill-amber-400" />
                            <span>Đã nhận +{getEventStatus(event.id)?.rewardValue?.toLocaleString('vi-VN')} điểm</span>
                          </div>
                        ) : (
                          <div className="text-white/40 text-xs italic">
                            Phần thưởng đã nhận (Vui lòng kiểm tra mục Thông báo để xem mã)
                          </div>
                        )
                      ) : (
                        <>
                          {event.reward?.type === 'points' && (
                            <>
                              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                              <span className="text-amber-400 font-bold">
                                +{event.reward.value?.toLocaleString('vi-VN')} điểm
                              </span>
                            </>
                          )}
                          {event.reward?.type === 'discount' && (
                            <>
                              <Gift className="w-5 h-5 text-green-400" />
                              <span className="text-green-400 font-bold">
                                Giảm {event.reward.value}%
                              </span>
                            </>
                          )}
                          {event.reward?.type === 'voucher' && (
                            <>
                              <Gift className="w-5 h-5 text-purple-400" />
                              <span className="text-purple-400 font-bold">
                                Voucher {event.reward.value}%
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Progress (if applicable) */}
                    {getEventStatus(event.id) && event.conditions?.days && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className="text-white/60">Tiến độ</span>
                          <span className="text-white font-semibold">
                            {getEventStatus(event.id)?.progress}/{event.conditions.days} ngày
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${((getEventStatus(event.id)?.progress || 0) / (event.conditions.days || 1)) * 100}%`
                            }}
                            className={`h-full bg-gradient-to-r ${eventColor}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Date Range */}
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(event.startDate)} - {formatDate(event.endDate)}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!!processingEventId || getEventStatus(event.id)?.rewardClaimed}
                      onClick={(e) => {
                        e.stopPropagation();
                        // If status is claimed, don't do anything
                        if (getEventStatus(event.id)?.rewardClaimed) return;

                        isActive ? handleAction(event) : setSelectedEvent(event);
                      }}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${isActive && !getEventStatus(event.id)?.rewardClaimed
                        ? 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg'
                        : 'bg-white/5 text-white/60 cursor-not-allowed'
                        }`}
                    >
                      {processingEventId === event.id ? 'Đang xử lý...' : isActive ? getEventActionButtonLabel(event) : 'Xem chi tiết'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-64">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

                {/* Event Icon */}
                {(() => {
                  const EventIcon = getEventIcon(selectedEvent.type);
                  const eventColor = getEventColor(selectedEvent.type);
                  return (
                    <div className={`absolute top-4 left-4 p-4 bg-gradient-to-br ${eventColor} rounded-xl`}>
                      <EventIcon className="w-8 h-8 text-white" />
                    </div>
                  );
                })()}

                {/* Status Badge */}
                {(() => {
                  const isActive = isEventActive(selectedEvent);
                  const isUpcoming = isEventUpcoming(selectedEvent);
                  return (
                    <div
                      className={`absolute top-4 right-4 px-4 py-2 rounded-full font-semibold ${isActive
                        ? 'bg-green-500 text-white'
                        : isUpcoming
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-500 text-white'
                        }`}
                    >
                      {isActive ? 'Đang diễn ra' : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
                    </div>
                  );
                })()}
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-bold text-white mb-3">
                  {selectedEvent.title}
                </h2>
                <p className="text-white/70 text-lg mb-6">
                  {selectedEvent.description}
                </p>

                {/* Reward Section */}
                <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5 mb-6">
                  <h3 className="text-white/60 text-sm uppercase tracking-wider mb-3">Phần thưởng</h3>
                  {selectedEvent.reward?.type === 'points' && (
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                      <div>
                        <p className="text-2xl font-bold text-amber-400">
                          +{selectedEvent.reward.value?.toLocaleString('vi-VN')} điểm
                        </p>
                        <p className="text-sm text-white/60">Tích lũy vào tài khoản</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.reward?.type === 'discount' && (
                    <div className="flex items-center gap-3">
                      <Gift className="w-8 h-8 text-green-400" />
                      <div>
                        <p className="text-2xl font-bold text-green-400">
                          Giảm {selectedEvent.reward.value}%
                        </p>
                        <p className="text-sm text-white/60">Áp dụng cho đơn hàng</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.reward?.type === 'voucher' && (
                    <div className="flex items-center gap-3">
                      <Gift className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold text-purple-400">
                          Voucher {selectedEvent.reward.value}%
                        </p>
                        <p className="text-sm text-white/60">Quà tặng đặc biệt</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conditions */}
                {Object.keys(selectedEvent.conditions || {}).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white/60 text-sm uppercase tracking-wider mb-3">Điều kiện</h3>
                    <div className="space-y-2">
                      {selectedEvent.conditions?.days && (
                        <p className="text-white/80">• Hoàn thành {selectedEvent.conditions.days} ngày liên tục</p>
                      )}
                      {selectedEvent.conditions?.minPurchase && (
                        <p className="text-white/80">
                          • Đơn hàng tối thiểu:{' '}
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(selectedEvent.conditions.minPurchase)}
                        </p>
                      )}
                      {selectedEvent.conditions?.specificDate && (
                        <p className="text-white/80">
                          • Áp dụng vào ngày: {formatDate(selectedEvent.conditions.specificDate)}
                        </p>
                      )}
                      {selectedEvent.conditions?.requireCoupleCode && (
                        <p className="text-white/80">• Cần mã cặp đôi khi mua hàng</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar (if applicable) */}
                {getEventStatus(selectedEvent.id) && selectedEvent.conditions?.days && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Tiến độ của bạn</span>
                      <span className="text-white font-semibold">
                        {getEventStatus(selectedEvent.id)?.progress}/{selectedEvent.conditions.days} ngày
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${((getEventStatus(selectedEvent.id)?.progress || 0) / (selectedEvent.conditions.days || 1)) * 100}%`
                        }}
                        className={`h-full bg-gradient-to-r ${getEventColor(selectedEvent.type)}`}
                      />
                    </div>
                  </div>
                )}

                {/* Event Duration */}
                <div className="flex items-center gap-2 text-white/60 mb-6">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {formatDate(selectedEvent.startDate)} - {formatDate(selectedEvent.endDate)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isEventActive(selectedEvent) && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!!processingEventId || getEventStatus(selectedEvent.id)?.rewardClaimed}
                      onClick={() => handleAction(selectedEvent)}
                      className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${getEventStatus(selectedEvent.id)?.rewardClaimed
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg'
                        }`}
                    >
                      {processingEventId === selectedEvent.id ? 'Đang xử lý...' : getEventActionButtonLabel(selectedEvent)}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEvent(null)}
                    className={`${isEventActive(selectedEvent) ? 'px-6' : 'flex-1'
                      } py-4 rounded-xl font-semibold text-lg bg-white/5 text-white hover:bg-white/10 transition-all`}
                  >
                    Đóng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Success Modal */}
      <AnimatePresence>
        {rewardClaimed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            onClick={() => setRewardClaimed(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              className="bg-zinc-900 border border-purple-500/30 rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Sparkles */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <Sparkles className="absolute top-10 left-10 text-purple-400 w-8 h-8 animate-pulse" />
                <Sparkles className="absolute bottom-10 right-10 text-pink-400 w-6 h-6 animate-pulse" />
                <Star className="absolute top-20 right-20 text-amber-400 w-4 h-4 animate-bounce" />
              </div>

              <div className="mb-6 relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-zinc-900"
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2 italic">Chúc Mừng!</h2>
              <p className="text-zinc-400 mb-8">
                Bạn đã nhận thưởng thành công từ sự kiện <br />
                <span className="text-purple-400 font-semibold">"{rewardClaimed.title}"</span>
              </p>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 relative group">
                {rewardClaimed.type === 'VOUCHER' ? (
                  <>
                    <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] mb-3 font-medium">Mã Voucher Của Bạn</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl font-black text-white tracking-widest font-mono">
                        {rewardClaimed.code}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (rewardClaimed.code) {
                            navigator.clipboard.writeText(rewardClaimed.code);
                            toast.success('Đã sao chép mã voucher!');
                          }
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-purple-400 transition-colors"
                        title="Sao chép"
                      >
                        <Copy className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Điểm thưởng đã nhận</p>
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                      <span className="text-4xl font-bold text-white">+{rewardClaimed.value}</span>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-zinc-500 mb-8">
                {rewardClaimed.type === 'VOUCHER'
                  ? 'Mã khuyến mãi đã được lưu vào kho voucher của bạn.'
                  : 'Điểm thưởng đã được cộng trực tiếp vào ví của bạn.'}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setRewardClaimed(null)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/25 transition-all"
              >
                Tuyệt vời!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
