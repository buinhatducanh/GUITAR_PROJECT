import prisma from './prisma.js';

export type NotificationType =
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_PROCESSING'
    | 'ORDER_SHIPPED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    | 'SYSTEM'
    | 'PROMO';

/**
 * Creates a new persistent notification for a user
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link,
            }
        });

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
}
