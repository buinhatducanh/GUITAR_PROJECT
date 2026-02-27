import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Send, Users, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '@/app/lib/api';

interface NotificationStats {
    total: number;
    unread: number;
    byType: { type: string; count: number }[];
}

const NOTIFICATION_TYPES = [
    { value: 'SYSTEM', label: 'Hệ thống' },
    { value: 'PROMO', label: 'Khuyến mãi' },
    { value: 'VOUCHER_RECEIVED', label: 'Voucher' },
    { value: 'ORDER_PLACED', label: 'Đơn hàng mới' },
];

const PRIORITY_LEVELS = [
    { value: 'LOW', label: 'Thấp' },
    { value: 'NORMAL', label: 'Bình thường' },
    { value: 'HIGH', label: 'Cao' },
    { value: 'URGENT', label: 'Khẩn cấp' },
];

const typeLabels: Record<string, string> = {
    ORDER_PLACED: 'Đặt hàng',
    ORDER_CONFIRMED: 'Xác nhận ĐH',
    ORDER_PROCESSING: 'Đang xử lý',
    ORDER_SHIPPED: 'Đang giao',
    ORDER_DELIVERED: 'Đã giao',
    ORDER_CANCELLED: 'Đã hủy',
    VOUCHER_RECEIVED: 'Nhận voucher',
    VOUCHER_EXPIRING: 'Voucher hết hạn',
    POINTS_EARNED: 'Nhận điểm',
    TIER_UPGRADE: 'Nâng hạng',
    PROMO: 'Khuyến mãi',
    SYSTEM: 'Hệ thống',
    WELCOME: 'Chào mừng',
    REVIEW_REMINDER: 'Nhắc đánh giá',
};

export const NotificationsTab: React.FC = () => {
    const [stats, setStats] = useState<NotificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [broadcastForm, setBroadcastForm] = useState({
        type: 'SYSTEM',
        title: '',
        message: '',
        link: '',
        priority: 'NORMAL',
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await notificationsApi.getStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to load notification stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
            toast.error('Vui lòng nhập tiêu đề và nội dung');
            return;
        }

        try {
            setSending(true);
            const result = await notificationsApi.broadcast({
                type: broadcastForm.type,
                title: broadcastForm.title.trim(),
                message: broadcastForm.message.trim(),
                link: broadcastForm.link.trim() || undefined,
                priority: broadcastForm.priority,
            });
            toast.success(`Đã gửi thông báo đến ${result.count} người dùng`);
            setBroadcastForm({ type: 'SYSTEM', title: '', message: '', link: '', priority: 'NORMAL' });
            loadStats();
        } catch (err) {
            toast.error('Gửi thông báo thất bại');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-purple-400" />
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản lý thông báo</h2>
                    <p className="text-white/50 text-sm">Gửi thông báo và xem thống kê</p>
                </div>
            </div>

            {/* Stats Cards */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
            ) : stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl p-5 border border-blue-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <span className="text-blue-300 text-sm font-medium">Tổng thông báo</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.total.toLocaleString('vi-VN')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-5 border border-amber-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-5 h-5 text-amber-400" />
                            <span className="text-amber-300 text-sm font-medium">Chưa đọc</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.unread.toLocaleString('vi-VN')}</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-5 border border-green-500/20"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 text-sm font-medium">Loại thông báo</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.byType.length}</p>
                    </motion.div>
                </div>
            )}

            {/* Type Breakdown */}
            {stats && stats.byType.length > 0 && (
                <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Phân loại thông báo</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.byType.map((item) => (
                            <div key={item.type} className="bg-white/5 rounded-lg p-3">
                                <p className="text-white/60 text-xs mb-1">{typeLabels[item.type] || item.type}</p>
                                <p className="text-white font-bold text-lg">{item.count.toLocaleString('vi-VN')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Broadcast Form */}
            <div className="bg-zinc-900/50 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-5">
                    <Send className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Gửi thông báo đến tất cả người dùng</h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/60 text-sm mb-1.5">Loại thông báo</label>
                            <select
                                value={broadcastForm.type}
                                onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                            >
                                {NOTIFICATION_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/60 text-sm mb-1.5">Mức ưu tiên</label>
                            <select
                                value={broadcastForm.priority}
                                onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                                className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none"
                            >
                                {PRIORITY_LEVELS.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-1.5">Tiêu đề</label>
                        <input
                            type="text"
                            value={broadcastForm.title}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                            placeholder="Nhập tiêu đề thông báo..."
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none placeholder:text-white/30"
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-1.5">Nội dung</label>
                        <textarea
                            value={broadcastForm.message}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                            placeholder="Nhập nội dung thông báo..."
                            rows={3}
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none placeholder:text-white/30 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-1.5">Link (tùy chọn)</label>
                        <input
                            type="text"
                            value={broadcastForm.link}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, link: e.target.value })}
                            placeholder="/products hoặc /promo ..."
                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none placeholder:text-white/30"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBroadcast}
                        disabled={sending}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};
