import { create } from 'zustand';
import { notificationsApi } from '@/app/lib/api';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    priority?: string;
    metadata?: Record<string, any> | null;
    createdAt: string;
}

interface NotificationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    hasFetched: boolean;
    pagination: NotificationPagination | null;
    sseConnected: boolean;
}

interface NotificationActions {
    fetchNotifications: (page?: number) => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllRead: () => Promise<void>;
    clearNotifications: () => void;
    addRealtimeNotification: (notification: Notification) => void;
    connectSSE: () => (() => void) | undefined;
}

type NotificationStore = NotificationState & NotificationActions;

const API_BASE = import.meta.env.VITE_API_URL || '';

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasFetched: false,
    pagination: null,
    sseConnected: false,

    fetchNotifications: async (page = 1) => {
        try {
            set({ isLoading: true });
            const data = await notificationsApi.getAll({ page, limit: 50 });
            const notifications = data.notifications || data as any;
            const pagination = data.pagination || null;
            set({
                notifications: page === 1 ? notifications : [...get().notifications, ...notifications],
                hasFetched: true,
                pagination,
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUnreadCount: async () => {
        try {
            const { count } = await notificationsApi.getUnreadCount();
            set({ unreadCount: count });
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    markAsRead: async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            const { notifications, unreadCount } = get();

            const target = notifications.find(n => n.id === id);
            if (target && !target.isRead) {
                const newNotifications = notifications.map(n =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                set({
                    notifications: newNotifications,
                    unreadCount: Math.max(0, unreadCount - 1)
                });
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationsApi.markAllAsRead();
            const { notifications } = get();

            const newNotifications = notifications.map(n => ({ ...n, isRead: true }));

            set({
                notifications: newNotifications,
                unreadCount: 0
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },

    deleteNotification: async (id: string) => {
        try {
            await notificationsApi.deleteOne(id);
            const { notifications, unreadCount } = get();
            const target = notifications.find(n => n.id === id);
            const wasUnread = target && !target.isRead;

            set({
                notifications: notifications.filter(n => n.id !== id),
                unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
            });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    deleteAllRead: async () => {
        try {
            await notificationsApi.deleteAllRead();
            const { notifications } = get();
            set({
                notifications: notifications.filter(n => !n.isRead),
            });
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    },

    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, hasFetched: false, pagination: null });
    },

    addRealtimeNotification: (notification: Notification) => {
        const { notifications, unreadCount } = get();

        // Avoid duplicates
        if (notifications.some(n => n.id === notification.id)) return;

        set({
            notifications: [notification, ...notifications],
            unreadCount: notification.isRead ? unreadCount : unreadCount + 1,
        });
    },

    connectSSE: () => {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return undefined;

        const url = `${API_BASE}/api/notifications/stream/user?token=${encodeURIComponent(token)}`;
        const es = new EventSource(url);

        es.addEventListener('notification', (event) => {
            try {
                const notification: Notification = JSON.parse(event.data);
                get().addRealtimeNotification(notification);

                // Show toast for new notifications
                const iconMap: Record<string, string> = {
                    ORDER_PLACED: '📦',
                    ORDER_CONFIRMED: '✅',
                    ORDER_PROCESSING: '⚙️',
                    ORDER_SHIPPED: '🚚',
                    ORDER_DELIVERED: '🎉',
                    ORDER_CANCELLED: '❌',
                    VOUCHER_RECEIVED: '🎁',
                    POINTS_EARNED: '⭐',
                    TIER_UPGRADE: '🏆',
                    PROMO: '🔥',
                    WELCOME: '👋',
                    SYSTEM: 'ℹ️',
                };
                const icon = iconMap[notification.type] || '🔔';
                toast(`${icon} ${notification.title}`, {
                    description: notification.message,
                    duration: 6000,
                });
            } catch (err) {
                console.error('Failed to parse SSE notification:', err);
            }
        });

        es.addEventListener('notifications_updated', () => {
            // Refetch when bulk operations happen
            get().fetchUnreadCount();
        });

        es.onopen = () => {
            set({ sseConnected: true });
        };

        es.onerror = () => {
            set({ sseConnected: false });
        };

        return () => {
            es.close();
            set({ sseConnected: false });
        };
    },
}));
