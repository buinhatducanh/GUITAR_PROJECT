import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Package, CheckCircle, Truck, XCircle, Gift, Info } from 'lucide-react';
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
        hasFetched
    } = useNotificationStore();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Initial fetch & polling
    useEffect(() => {
        if (!user) return;

        fetchUnreadCount();
        const pollInterval = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // 30s

        return () => clearInterval(pollInterval);
    }, [user, fetchUnreadCount]);

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
            case 'PROMO':
            case 'VOUCHER_RECEIVED': return <Gift className="w-5 h-5 text-pink-400" />;
            default: return <Info className="w-5 h-5 text-zinc-400" />;
        }
    };

    if (!user) return null;

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
                            <h3 className="font-bold text-lg text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAllAsRead()}
                                    className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"
                                >
                                    Đánh dấu đã đọc
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto overflow-x-hidden flex-1 p-2 space-y-1 nice-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-white/50">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Bạn không có thông báo nào</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${notification.isRead
                                                ? 'hover:bg-white/5 opacity-80'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className={`text-sm mb-1 ${notification.isRead ? 'text-white/90' : 'text-white font-semibold'}`}>
                                                {/* Bold parts of the message that might be variables like order numbers if we had them formatted that way, but for now just show message */}
                                                <span className="block">{notification.message}</span>
                                            </p>
                                            <p className={`text-xs ${notification.isRead ? 'text-white/40' : 'text-amber-400/80 font-medium'}`}>
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 flex items-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            </div>
                                        )}
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
