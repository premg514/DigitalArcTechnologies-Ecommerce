import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    stock: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                set((state) => {
                    const existingItem = state.items.find(
                        (i) => i.productId === item.productId
                    );

                    if (existingItem) {
                        // Update quantity if item already exists
                        const newItems = state.items.map((i) =>
                            i.productId === item.productId
                                ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock) }
                                : i
                        );
                        toast.success(`${item.name} added to cart!`);
                        return { items: newItems };
                    }

                    // Add new item
                    toast.success(`${item.name} added to cart!`);
                    return {
                        items: [...state.items, item],
                    };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                }));
                toast.success('Removed from cart');
            },

            updateQuantity: (productId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
                            : item
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
                toast.success('Cart cleared');
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
