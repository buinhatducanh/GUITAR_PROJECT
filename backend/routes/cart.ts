import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../shared/middleware/auth.js';
import prisma from '../shared/lib/prisma.js';

const router = Router();

// Lấy thông tin giỏ hàng của user hiện tại (nếu chưa có thì tự động tạo)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });
        }

        res.json({ success: true, data: cart });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi lấy thông tin giỏ hàng' });
    }
});

// Thêm sản phẩm vào giỏ hàng (cộng dồn số lượng nếu đã tồn tại)
router.post('/items', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { productId, quantity } = req.body;

        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            res.status(400).json({ success: false, error: 'Dữ liệu đầu vào không hợp lệ' });
            return;
        }

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: { cartId: cart.id, productId }
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });

        res.json({ success: true, data: updatedCart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi thêm vào giỏ hàng' });
    }
});

// Cập nhật số lượng chính xác của một sản phẩm
router.put('/items/:productId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (typeof quantity !== 'number') {
            res.status(400).json({ success: false, error: 'Số lượng không hợp lệ' });
            return;
        }

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            res.status(404).json({ success: false, error: 'Không tìm thấy giỏ hàng' });
            return;
        }

        if (quantity <= 0) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id, productId }
            });
        } else {
            const existingItem = await prisma.cartItem.findUnique({
                where: { cartId_productId: { cartId: cart.id, productId } }
            });

            if (existingItem) {
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity }
                });
            } else {
                await prisma.cartItem.create({
                    data: { cartId: cart.id, productId, quantity }
                });
            }
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });

        res.json({ success: true, data: updatedCart });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật giỏ hàng' });
    }
});

// Xóa một sản phẩm cụ thể khỏi giỏ hàng
router.delete('/items/:productId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { productId } = req.params;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            res.status(404).json({ success: false, error: 'Không tìm thấy giỏ hàng' });
            return;
        }

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id, productId }
        });

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });

        res.json({ success: true, data: updatedCart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng' });
    }
});

// Xóa sạch toàn bộ sản phẩm trong giỏ
router.delete('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart?.id },
            include: { items: { include: { product: true } } }
        });

        res.json({ success: true, data: updatedCart || { items: [] } });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi xóa sạch giỏ hàng' });
    }
});

// Đồng bộ (nhận mảng items từ frontend Local Storage và gộp chung)
router.post('/sync', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { items } = req.body; // Array of { productId, quantity }

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const { productId, quantity } = item;
                if (!productId || typeof quantity !== 'number' || quantity <= 0) continue;

                const existingItem = await prisma.cartItem.findUnique({
                    where: { cartId_productId: { cartId: cart.id, productId } }
                });

                if (existingItem) {
                    await prisma.cartItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: existingItem.quantity + quantity }
                    });
                } else {
                    await prisma.cartItem.create({
                        data: { cartId: cart.id, productId, quantity }
                    });
                }
            }
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });

        res.json({ success: true, data: updatedCart });
    } catch (error) {
        console.error('Error syncing cart:', error);
        res.status(500).json({ success: false, error: 'Lỗi server khi đồng bộ giỏ hàng' });
    }
});

export default router;
