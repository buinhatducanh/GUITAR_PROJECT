import { create } from 'zustand';

interface CartState {
    isOpen: boolean;
}

interface CartActions {
    setIsOpen: (open: boolean) => void;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()((set) => ({
    isOpen: false,
    setIsOpen: (open: boolean) => set({ isOpen: open }),
}));
