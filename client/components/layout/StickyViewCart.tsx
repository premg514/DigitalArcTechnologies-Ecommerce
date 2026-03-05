'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function StickyViewCart() {
    const pathname = usePathname();
    const { items, getTotalItems, getTotalPrice } = useCart();
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    if (totalItems === 0 || pathname === '/checkout') return null;

    const isCartPage = pathname === '/cart';

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
            <Link
                href={isCartPage ? "/checkout" : "/cart"}
                className="pointer-events-auto flex items-center justify-between w-full h-14 bg-secondary text-white rounded-2xl px-6 shadow-2xl animate-slideUp"
            >
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                            {totalItems} item{totalItems > 1 ? 's' : ''} added
                        </span>
                        <span className="text-sm font-bold">{formatPrice(totalPrice)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                    {isCartPage ? (
                        <>Checkout <ArrowRight className="h-4 w-4" /></>
                    ) : (
                        <>View Cart <ShoppingBag className="h-4 w-4" /></>
                    )}
                </div>
            </Link>
        </div>
    );
}
