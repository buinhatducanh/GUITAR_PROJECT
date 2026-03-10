import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';
import { deleteCloudinaryImages, collectImageUrls } from '../shared/utils/cloudinary-cleanup.js';
import { notifyVoucherReceived, notifyPointsEarned } from '../lib/notification.helper.js';

const router = Router();

/** GET /api/events — list active events */
router.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: 'desc' },
        });

        // Map flat DB fields to nested frontend structure
        const mappedEvents = events.map(e => ({
            ...e,
            type: e.type.toLowerCase(),
            reward: {
                type: e.rewardType.toLowerCase(),
                value: e.rewardValue
            }
        }));

        res.json(mappedEvents);
    } catch (err) {
        console.error('Get events error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** GET /api/events/my-status — get user event statuses */
router.get('/my-status', authenticate, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId as string;
        let userEvents = await prisma.userEvent.findMany({
            where: { userId },
            include: {
                event: true
            }
        });

        // Find active FIRST_PURCHASE events
        const activeFirstPurchaseEvents = await prisma.event.findMany({
            where: { type: 'FIRST_PURCHASE', isActive: true }
        });

        // Check for eligibility and auto-join/auto-complete
        const orderCount = await prisma.order.count({
            where: { userId, status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] as any } }
        });

        if (orderCount > 0) {
            for (const event of activeFirstPurchaseEvents) {
                const existingIndex = userEvents.findIndex(ue => ue.eventId === event.id);

                if (existingIndex === -1) {
                    // Not joined yet, but has orders -> Auto-join and complete
                    const newUE = await prisma.userEvent.create({
                        data: {
                            userId,
                            eventId: event.id,
                            progress: 1,
                            completed: true,
                            rewardClaimed: false
                        },
                        include: { event: true }
                    });
                    (userEvents as any[]).push(newUE);
                } else {
                    // Already joined, but maybe not completed
                    const ue = userEvents[existingIndex];
                    if (!ue.completed) {
                        const updatedUE = await prisma.userEvent.update({
                            where: { id: ue.id },
                            data: { completed: true, progress: 1 },
                            include: { event: true }
                        });
                        (userEvents as any[])[existingIndex] = updatedUE;
                    }
                }
            }
        }

        res.json(userEvents);
    } catch (err) {
        console.error('Get my-status error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/events/:id/join — join an event */
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
    try {
        const eventId = req.params.id as string;
        const userId = req.userId as string;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ error: 'Sự kiện không tồn tại' });

        const existing = await prisma.userEvent.findUnique({
            where: { userId_eventId: { userId, eventId } }
        });

        if (existing) {
            return res.status(400).json({ error: 'Bạn đã tham gia sự kiện này rồi' });
        }

        let isCompleted = false;
        if (event.type === 'FIRST_PURCHASE') {
            const orderCount = await prisma.order.count({
                where: { userId, status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] as any } }
            });
            if (orderCount > 0) isCompleted = true;
        } else if (event.type === 'SPECIAL_DAY') {
            const conditions = event.conditions as any;
            const target = conditions?.targetProgress || 1;
            if (target <= 1) isCompleted = true;
        }

        const userEventResponse = await prisma.userEvent.create({
            data: {
                userId,
                eventId,
                progress: isCompleted ? 1 : 0,
                completed: isCompleted,
                rewardClaimed: false
            }
        });

        res.status(201).json(userEventResponse);
    } catch (err) {
        console.error('Join event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/events/:id/checkin — daily check-in */
router.post('/:id/checkin', authenticate, async (req: AuthRequest, res) => {
    try {
        const eventId = req.params.id as string;
        const userId = req.userId as string;

        const userEventData = await prisma.userEvent.findUnique({
            where: { userId_eventId: { userId, eventId } },
            include: { event: true }
        });

        if (!userEventData) {
            return res.status(404).json({ error: 'Bạn chưa tham gia sự kiện này' });
        }

        const eventType = userEventData.event.type;
        if (eventType !== 'LOGIN_STREAK' && eventType !== 'SPECIAL_DAY') {
            return res.status(400).json({ error: 'Sự kiện này không hỗ trợ điểm danh' });
        }

        if (userEventData.completed) {
            return res.status(400).json({ error: 'Bạn đã hoàn thành sự kiện này rồi' });
        }

        const now = new Date();
        if (userEventData.lastCheckIn) {
            const lastCheckInDate = new Date(userEventData.lastCheckIn).toDateString();
            const today = now.toDateString();

            if (lastCheckInDate === today) {
                return res.status(400).json({ error: 'Bạn đã điểm danh hôm nay rồi' });
            }
        }

        const newProgress = userEventData.progress + 1;
        const conditions = userEventData.event.conditions as any;
        const goal = conditions?.days || 1;

        const updated = await prisma.userEvent.update({
            where: { id: userEventData.id },
            data: {
                progress: newProgress,
                lastCheckIn: now,
                completed: newProgress >= goal
            }
        });

        res.json(updated);
    } catch (err) {
        console.error('Check-in error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/events/:id/claim-reward — claim reward */
router.post('/:id/claim-reward', authenticate, async (req: AuthRequest, res) => {
    try {
        const eventId = req.params.id as string;
        const userId = req.userId as string;

        const userEventData = await prisma.userEvent.findUnique({
            where: { userId_eventId: { userId: userId!, eventId } },
            include: { event: true }
        }) as any;

        if (!userEventData || !userEventData.completed) {
            return res.status(400).json({ error: 'Bạn chưa hoàn thành sự kiện' });
        }

        if (userEventData.rewardClaimed) {
            return res.status(400).json({ error: 'Bạn đã nhận quà rồi' });
        }

        // Logic check reward type
        let rewardDetails: any = null;
        if (userEventData.event.rewardType === 'VOUCHER') {
            const randomCode = `${userEventData.event.type.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const voucher = await prisma.voucher.create({
                data: {
                    code: randomCode,
                    title: userEventData.event.title,
                    description: `Phần thưởng từ sự kiện ${userEventData.event.title}`,
                    discountType: 'PERCENTAGE', // Or based on event.rewardValue if needed
                    discountValue: userEventData.event.rewardValue,
                    pointsCost: 0,
                    minPurchase: 0,
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    usageLimit: 1,
                    usedCount: 0,
                    isActive: true
                }
            });

            await prisma.userVoucher.create({
                data: {
                    userId,
                    voucherId: voucher.id,
                    isUsed: false
                }
            });

            // Add notification
            await notifyVoucherReceived(userId, userEventData.event.title, randomCode);

            rewardDetails = { type: 'VOUCHER', code: randomCode };
        } else if (userEventData.event.rewardType === 'POINTS') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    points: { increment: userEventData.event.rewardValue }
                }
            });

            // Add notification
            await notifyPointsEarned(userId, userEventData.event.rewardValue, `Phần thưởng từ sự kiện ${userEventData.event.title}`);

            rewardDetails = { type: 'POINTS', value: userEventData.event.rewardValue };
        }

        console.log(`[Events] Claiming reward for user ${userId}, event ${userEventData.eventId}. Details:`, rewardDetails);

        const updated = await prisma.userEvent.update({
            where: { id: userEventData.id },
            data: {
                rewardClaimed: true,
                rewardCode: rewardDetails?.type === 'VOUCHER' ? rewardDetails.code : null,
                rewardValue: rewardDetails?.type === 'POINTS' ? rewardDetails.value : null
            }
        });

        console.log('[Events] UserEvent updated successfully:', updated);

        res.json({
            message: 'Nhận quà thành công',
            userEvent: updated,
            rewardDetails
        });
    } catch (err) {
        console.error('Claim reward error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** POST /api/events */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const event = await prisma.event.create({ data: req.body });
        res.status(201).json(event);
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** PUT /api/events/:id */
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const event = await prisma.event.update({
            where: { id: req.params.id as string },
            data: req.body,
        });
        res.json(event);
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

/** DELETE /api/events/:id */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const event = await prisma.event.findUnique({
            where: { id: req.params.id as string },
            select: { image: true },
        });

        await prisma.event.delete({ where: { id: req.params.id as string } });

        if (event) {
            const urls = collectImageUrls(event, ['image']);
            deleteCloudinaryImages(urls).catch(() => { });
        }

        res.json({ message: 'Đã xóa sự kiện' });
    } catch (err) {
        console.error('Delete event error:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

export default router;
