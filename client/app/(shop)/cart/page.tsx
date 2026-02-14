'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CartItem from '@/components/shop/CartItem';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { TAX_RATE, SHIPPING_CHARGES } from '@/lib/constants';

export default function CartPage() {
    const { items, getTotalPrice, clearCart } = useCart();

    const subtotal = getTotalPrice();
    const tax = subtotal * TAX_RATE;
    const shipping =
        subtotal >= SHIPPING_CHARGES.FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_CHARGES.STANDARD_CHARGE;
    const total = subtotal + tax + shipping;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center space-y-6">
                    <ShoppingBag className="h-24 w-24 mx-auto text-zinc-300" />
                    <h1 className="text-3xl font-bold">Your cart is empty</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Looks like you haven't added anything to your cart yet.
                    </p>
                    <div className="flex flex-col gap-3 items-center justify-center">
                        <Link href="/">
                            <Button size="lg">
                                Continue Shopping
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/orders">
                            <Button variant="link" className="text-zinc-500">
                                View Order History
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cart Items ({items.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {items.map((item) => (
                                <CartItem key={item.productId} item={item} />
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                onClick={clearCart}
                                className="text-red-600 hover:text-red-700"
                            >
                                Clear Cart
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                <span className="font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Tax (GST {TAX_RATE * 100}%)
                                </span>
                                <span className="font-medium">{formatPrice(tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                                <span className="font-medium">
                                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                                </span>
                            </div>
                            {subtotal < SHIPPING_CHARGES.FREE_SHIPPING_THRESHOLD && (
                                <p className="text-xs text-blue-600">
                                    Add {formatPrice(SHIPPING_CHARGES.FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                                </p>
                            )}
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/checkout" className="w-full">
                                <Button size="lg" className="w-full">
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
