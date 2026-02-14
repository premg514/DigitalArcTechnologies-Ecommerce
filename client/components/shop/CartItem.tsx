'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart, type CartItem as CartItemType } from '@/hooks/useCart';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();

    const handleDecrease = () => {
        if (item.quantity > 1) {
            updateQuantity(item.productId, item.quantity - 1);
        }
    };

    const handleIncrease = () => {
        if (item.quantity < item.stock) {
            updateQuantity(item.productId, item.quantity + 1);
        }
    };

    const handleRemove = () => {
        removeItem(item.productId);
    };

    return (
        <div className="flex gap-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
            {/* Product Image */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                />
            </div>

            {/* Product Details - Mobile and Desktop Layout Handling */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
                {/* Top Row: Name and Price */}
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 md:line-clamp-none">{item.name}</h3>
                    <p className="text-sm sm:text-lg font-bold flex-shrink-0">{formatPrice(item.price)}</p>
                </div>

                {/* Bottom Row: Quantity and Subtotal/Stock */}
                <div className="flex justify-between items-end mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDecrease}
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleIncrease}
                            disabled={item.quantity >= item.stock}
                            className="h-7 w-7 sm:h-8 sm:w-8"
                        >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>

                    {/* Actions and Subtotal */}
                    <div className="flex flex-col items-end gap-1">
                        <p className="font-bold text-sm sm:text-lg">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                        {item.stock < 10 && (
                            <p className="text-xs text-orange-600">
                                Only {item.stock} left
                            </p>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-0 text-xs sm:text-sm"
                        >
                            <Trash2 className="h-4 w-4 sm:mr-1" />
                            <span className="sr-only sm:not-sr-only">Remove</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
