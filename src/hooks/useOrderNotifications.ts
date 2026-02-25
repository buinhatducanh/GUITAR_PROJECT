import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface OrderNotification {
    id: string;
    orderNumber: string;
    totalAmount: number;
    phone?: string;
    address?: string;
    itemCount: number;
    createdAt: string;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/**
 * Hook that connects to the SSE notification stream.
 * Shows a toast + plays a sound when a new order comes in.
 */
export function useOrderNotifications(onNewOrder?: (order: OrderNotification) => void) {
    // Store callback in ref so SSE listener always sees the latest version
    // without needing to reconnect
    const callbackRef = useRef(onNewOrder);
    callbackRef.current = onNewOrder;

    const playSound = useCallback(() => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch {
            // Audio not supported
        }
    }, []);

    useEffect(() => {
        const url = `${API_BASE}/api/notifications/stream`;
        console.log('🔔 Connecting to SSE:', url);
        const es = new EventSource(url);

        es.addEventListener('new_order', (event) => {
            console.log('🔔 SSE new_order event received:', event.data);
            try {
                const order: OrderNotification = JSON.parse(event.data);

                // Play sound
                playSound();

                // Show toast FIRST (before any state changes that might re-render)
                toast.success(`🛒 Đơn hàng mới #${order.orderNumber}`, {
                    description: `${order.itemCount} sản phẩm · ${formatPrice(Number(order.totalAmount))}${order.phone ? ` · SĐT: ${order.phone}` : ''}`,
                    duration: 10000,
                });

                // Then call callback (which may trigger re-render)
                setTimeout(() => {
                    callbackRef.current?.(order);
                }, 500);
            } catch (err) {
                console.error('🔔 Failed to parse SSE event:', err);
            }
        });

        es.addEventListener('order_status', (event) => {
            try {
                const data = JSON.parse(event.data);
                toast.info(`📋 Đơn #${data.orderNumber}: ${data.status}`);
            } catch {
                // ignore
            }
        });

        es.onopen = () => {
            console.log('🔔 SSE connection opened');
        };

        es.onerror = () => {
            console.warn('🔔 SSE connection error, will auto-reconnect...');
        };

        return () => {
            console.log('🔔 SSE connection closing');
            es.close();
        };
        // Empty deps — connect once, never reconnect due to callback changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
