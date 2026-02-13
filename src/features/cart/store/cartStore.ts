import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../../../shared/types';
import { toast } from 'sonner';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

interface CartActions {
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setIsOpen: (open: boolean) => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            // State
            items: [],
            isOpen: false,

            // Actions
            addItem: (product: Product) => {
                const items = get().items;
                const existingItem = items.find(
                    (item) => item.product.id === product.id
                );

                if (existingItem) {
                    // Increment quantity
                    set({
                        items: items.map((item) =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                    toast.success(`Đã cập nhật số lượng ${product.name}`);
                } else {
                    // Add new item
                    set({
                        items: [...items, { product, quantity: 1 }],
                    });
                    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
                }

                // Auto-open cart
                set({ isOpen: true });
            },

            removeItem: (productId: string) => {
                const items = get().items;
                const item = items.find((item) => item.product.id === productId);

                set({
                    items: items.filter((item) => item.product.id !== productId),
                });

                if (item) {
                    toast.success(`Đã xóa ${item.product.name} khỏi giỏ hàng`);
                }
            },

            updateQuantity: (productId: string, quantity: number) => {
                const items = get().items;

                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: items.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    ),
                });
            },

            clearCart: () => {
                set({ items: [] });
                toast.success('Đã xóa toàn bộ giỏ hàng');
            },

            setIsOpen: (open: boolean) => {
                set({ isOpen: open });
            },

            getTotalPrice: () => {
                const items = get().items;
                return items.reduce(
                    (total, item) => total + item.product.price * item.quantity,
                    0
                );
            },

            getTotalItems: () => {
                const items = get().items;
                return items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                items: state.items,
            }),
        }
    )
);
