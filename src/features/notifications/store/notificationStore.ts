import { create } from 'zustand';
import { notificationsApi } from '@/app/lib/api';
import { useAuthStore } from '@/features/auth/store/authStore';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string | null;
    isRead: boolean;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    hasFetched: boolean;
}

interface NotificationActions {
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasFetched: false,

    fetchNotifications: async () => {
        try {
            set({ isLoading: true });
            const data = await notificationsApi.getAll();
            set({ notifications: data, hasFetched: true });
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

            const newNotifications = notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            );

            set({
                notifications: newNotifications,
                unreadCount: Math.max(0, unreadCount - 1)
            });
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

    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, hasFetched: false });
    }
}));
