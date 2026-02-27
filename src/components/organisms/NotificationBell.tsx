import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bell, Package, CheckCircle, Truck, XCircle, Gift, Info,
    Star, Trophy, Megaphone, UserPlus, Trash2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, type Notification } from '@/features/notifications/store/notificationStore';
import { useAuthStore } from '@/features/auth/store/authStore';

export const NotificationBell: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        hasFetched,
        connectSSE,
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Initial fetch, polling & SSE
    useEffect(() => {
        if (!user) return;

        fetchUnreadCount();

        // Connect SSE for real-time notifications
        const disconnectSSE = connectSSE();

        // Fallback polling every 60s (in case SSE is not connected)
        const pollInterval = setInterval(() => {
            fetchUnreadCount();
        }, 60000);

        return () => {
            clearInterval(pollInterval);
            disconnectSSE?.();
        };
    }, [user, fetchUnreadCount, connectSSE]);

    // Fetch full list when opening
    useEffect(() => {
        if (isOpen && !hasFetched) {
            fetchNotifications();
        }
    }, [isOpen, hasFetched, fetchNotifications]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteNotification(id);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        return date.toLocaleDateString('vi-VN');
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER_PLACED': return <Package className="w-5 h-5 text-blue-400" />;
            case 'ORDER_CONFIRMED': return <CheckCircle className="w-5 h-5 text-amber-400" />;
            case 'ORDER_PROCESSING': return <Package className="w-5 h-5 text-amber-500" />;
            case 'ORDER_SHIPPED': return <Truck className="w-5 h-5 text-purple-400" />;
            case 'ORDER_DELIVERED': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'ORDER_CANCELLED': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'VOUCHER_RECEIVED':
            case 'VOUCHER_EXPIRING': return <Gift className="w-5 h-5 text-pink-400" />;
            case 'POINTS_EARNED': return <Star className="w-5 h-5 text-amber-400" />;
            case 'TIER_UPGRADE': return <Trophy className="w-5 h-5 text-yellow-400" />;
            case 'PROMO': return <Megaphone className="w-5 h-5 text-orange-400" />;
            case 'WELCOME': return <UserPlus className="w-5 h-5 text-emerald-400" />;
            case 'REVIEW_REMINDER': return <Star className="w-5 h-5 text-blue-300" />;
            default: return <Info className="w-5 h-5 text-zinc-400" />;
        }
    };

    const getPriorityIndicator = (priority?: string) => {
        if (priority === 'URGENT') return 'border-l-2 border-l-red-500';
        if (priority === 'HIGH') return 'border-l-2 border-l-amber-500';
        return '';
    };

    if (!user) return null;

    const readNotifications = notifications.filter(n => n.isRead);
    const hasReadNotifications = readNotifications.length > 0;

    return (
        <div className="relative" ref={menuRef}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/80 hover:text-white transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-zinc-950"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        style={{ maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-white">Thông báo</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">
                                        {unreadCount} mới
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {hasReadNotifications && (
                                    <button
                                        onClick={() => deleteAllRead()}
                                        className="text-white/40 hover:text-red-400 transition-colors p-1"
                                        title="Xóa thông báo đã đọc"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsRead()}
                                        className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                                    >
                                        Đọc tất cả
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto overflow-x-hidden flex-1 p-2 space-y-1 nice-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-white/50">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Bạn không có thông báo nào</p>
                                    <p className="text-xs text-white/30 mt-1">Thông báo mới sẽ hiển thị ở đây</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${getPriorityIndicator(notification.priority)} ${notification.isRead
                                                ? 'hover:bg-white/5 opacity-70'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-1">
                                            <p className={`text-xs mb-0.5 ${notification.isRead ? 'text-white/50' : 'text-amber-400/80 font-medium'}`}>
                                                {notification.title}
                                            </p>
                                            <p className={`text-sm leading-snug ${notification.isRead ? 'text-white/70' : 'text-white'}`}>
                                                {notification.message}
                                            </p>
                                            <p className={`text-xs mt-1 ${notification.isRead ? 'text-white/30' : 'text-white/50'}`}>
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1"></div>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(e, notification.id)}
                                                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-0.5"
                                                title="Xóa"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
