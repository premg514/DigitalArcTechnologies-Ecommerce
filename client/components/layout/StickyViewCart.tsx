'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function StickyViewCart() {
    const { items, getTotalItems, getTotalPrice } = useCart();
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
            <Link
                href="/cart"
                className="pointer-events-auto flex items-center justify-between w-full h-14 bg-secondary text-white rounded-2xl px-6 shadow-2xl animate-slideUp"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingBag className="h-6 w-6" />
                        <span className="absolute -top-2 -right-2 bg-white text-secondary text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                            {totalItems}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">View Your Cart</span>
                        <span className="text-sm font-bold">{formatPrice(totalPrice)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                </div>
            </Link>
        </div>
    );
}
