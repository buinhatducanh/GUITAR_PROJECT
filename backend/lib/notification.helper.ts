import prisma from './prisma.js';
import { broadcastToUser } from './notifications.js';

export type NotificationType =
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_PROCESSING'
    | 'ORDER_SHIPPED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'VOUCHER_RECEIVED'
    | 'VOUCHER_EXPIRING'
    | 'POINTS_EARNED'
    | 'TIER_UPGRADE'
    | 'PROMO'
    | 'SYSTEM'
    | 'WELCOME'
    | 'REVIEW_REMINDER';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

interface CreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
    expiresAt?: Date;
}

/**
 * Creates a new persistent notification for a user and pushes via SSE
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    priority?: NotificationPriority,
    metadata?: Record<string, any>
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
                priority: priority || 'NORMAL',
                metadata: metadata || undefined,
            }
        });

        // Push real-time notification via SSE to user
        broadcastToUser(userId, 'notification', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            link: notification.link,
            priority: notification.priority,
            isRead: false,
            createdAt: notification.createdAt.toISOString(),
        });

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
}

/**
 * Create multiple notifications in batch (e.g., for broadcast)
 */
export async function createBulkNotifications(inputs: CreateNotificationInput[]) {
    try {
        const result = await prisma.notification.createMany({
            data: inputs.map(input => ({
                userId: input.userId,
                type: input.type,
                title: input.title,
                message: input.message,
                link: input.link,
                priority: input.priority || 'NORMAL',
                metadata: input.metadata || undefined,
                expiresAt: input.expiresAt,
            }))
        });

        // Push SSE to each unique user
        const uniqueUserIds = [...new Set(inputs.map(i => i.userId))];
        for (const uid of uniqueUserIds) {
            broadcastToUser(uid, 'notifications_updated', { action: 'bulk_create' });
        }

        return result;
    } catch (error) {
        console.error('Failed to create bulk notifications:', error);
        return null;
    }
}

/**
 * Broadcast a notification to all users (admin action)
 */
export async function broadcastNotificationToAll(
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    priority?: NotificationPriority
) {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'USER' },
            select: { id: true }
        });

        const inputs: CreateNotificationInput[] = users.map(u => ({
            userId: u.id,
            type,
            title,
            message,
            link,
            priority,
        }));

        return await createBulkNotifications(inputs);
    } catch (error) {
        console.error('Failed to broadcast notification:', error);
        return null;
    }
}

// ─── Convenience helpers for specific notification types ─────

export function notifyOrderPlaced(userId: string, orderNumber: string) {
    return createNotification(
        userId,
        'ORDER_PLACED',
        'Đặt hàng thành công',
        `Đơn hàng ${orderNumber} của bạn đã được đặt thành công. Chúng tôi sẽ xử lý trong thời gian sớm nhất.`,
        '/account?tab=orders',
        'NORMAL',
        { orderNumber }
    );
}

export async function notifyAdminsNewOrder(orderNumber: string, totalAmount: number) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });

        const inputs: CreateNotificationInput[] = admins.map(admin => ({
            userId: admin.id,
            type: 'SYSTEM',
            title: 'Có đơn hàng mới!',
            message: `Đơn hàng ${orderNumber} trị giá ${totalAmount.toLocaleString('vi-VN')}đ vừa được đặt.`,
            link: '/admin/orders',
            priority: 'HIGH',
            metadata: { orderNumber, totalAmount }
        }));

        return await createBulkNotifications(inputs);
    } catch (error) {
        console.error('Failed to notify admins of new order:', error);
        return null;
    }
}

export function notifyOrderStatusChange(
    userId: string,
    orderNumber: string,
    status: string
) {
    const statusConfig: Record<string, { type: NotificationType; text: string; priority: NotificationPriority }> = {
        CONFIRMED: { type: 'ORDER_CONFIRMED', text: 'đã được xác nhận', priority: 'NORMAL' },
        PROCESSING: { type: 'ORDER_PROCESSING', text: 'đang được xử lý', priority: 'NORMAL' },
        SHIPPED: { type: 'ORDER_SHIPPED', text: 'đã được giao cho đơn vị vận chuyển', priority: 'HIGH' },
        DELIVERED: { type: 'ORDER_DELIVERED', text: 'đã giao thành công', priority: 'HIGH' },
        CANCELLED: { type: 'ORDER_CANCELLED', text: 'đã bị hủy', priority: 'URGENT' },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return createNotification(
        userId,
        config.type,
        'Cập nhật đơn hàng',
        `Đơn hàng ${orderNumber} của bạn ${config.text}.`,
        '/account?tab=orders',
        config.priority,
        { orderNumber, status }
    );
}

export function notifyVoucherReceived(userId: string, voucherTitle: string, voucherCode: string) {
    return createNotification(
        userId,
        'VOUCHER_RECEIVED',
        'Bạn nhận được voucher mới!',
        `Voucher "${voucherTitle}" (${voucherCode}) đã được thêm vào tài khoản của bạn.`,
        '/rewards',
        'NORMAL',
        { voucherCode, voucherTitle }
    );
}

export function notifyPointsEarned(userId: string, points: number, reason: string) {
    return createNotification(
        userId,
        'POINTS_EARNED',
        'Bạn vừa nhận điểm thưởng!',
        `+${points.toLocaleString('vi-VN')} điểm: ${reason}`,
        '/rewards',
        'NORMAL',
        { points, reason }
    );
}

export function notifyTierUpgrade(userId: string, newTier: string) {
    const tierNames: Record<string, string> = {
        SILVER: 'Silver',
        GOLD: 'Gold',
        PLATINUM: 'Platinum',
    };

    return createNotification(
        userId,
        'TIER_UPGRADE',
        'Nâng hạng thành viên!',
        `Chúc mừng! Bạn đã được nâng lên hạng ${tierNames[newTier] || newTier}. Hãy khám phá các ưu đãi mới!`,
        '/rewards',
        'HIGH',
        { newTier }
    );
}

export function notifyWelcome(userId: string, userName: string) {
    return createNotification(
        userId,
        'WELCOME',
        'Chào mừng bạn đến Guitar NOVA!',
        `Xin chào ${userName}! Cảm ơn bạn đã đăng ký tài khoản. Khám phá các sản phẩm guitar chất lượng ngay nhé!`,
        '/products',
        'NORMAL',
        { userName }
    );
}

/**
 * Clean up expired notifications (can be called periodically)
 */
export async function cleanupExpiredNotifications() {
    try {
        const result = await prisma.notification.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
        return result.count;
    } catch (error) {
        console.error('Failed to cleanup expired notifications:', error);
        return 0;
    }
}
