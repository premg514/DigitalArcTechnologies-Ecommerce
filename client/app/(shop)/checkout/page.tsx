'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/utils';
import { TAX_RATE, SHIPPING_CHARGES, RAZORPAY_KEY } from '@/lib/constants';
import api from '@/lib/api';
import AddressSelector from '@/components/checkout/AddressSelector';
import GuestAddressForm from '@/components/checkout/GuestAddressForm';
import { Address } from '@/types/user';
import { LogIn, UserPlus, User } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCart();
    const { user, isAuthenticated, isLoading } = useAuth();
    const createOrder = useCreateOrder();

    const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutMode, setCheckoutMode] = useState<'choice' | 'guest' | 'authenticated'>('authenticated');

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                setCheckoutMode('authenticated');
            } else if (checkoutMode === 'authenticated') {
                setCheckoutMode('choice');
            }
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0 && !selectedAddress) {
            const defaultAddress = user.addresses.find(a => a.isDefault) || user.addresses[0];
            setSelectedAddress(defaultAddress);
        }
    }, [user, selectedAddress]);

    const subtotal = getTotalPrice();
    const tax = subtotal * TAX_RATE;
    const shipping =
        subtotal >= SHIPPING_CHARGES.FREE_SHIPPING_THRESHOLD
            ? 0
            : SHIPPING_CHARGES.STANDARD_CHARGE;
    const total = subtotal + tax + shipping;

    const handlePayment = async () => {
        if (!selectedAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        try {
            setIsProcessing(true);

            // 1. Create Razorpay order first (no DB order yet)
            const { data: paymentResponse } = await api.post('/payment/create-order', {
                items: items,
                shippingPrice: shipping,
                taxPrice: tax
            });

            const options = {
                key: RAZORPAY_KEY,
                amount: paymentResponse.data.amount,
                currency: 'INR',
                name: 'Amrutha', // Using new brand name
                description: 'Order Payment',
                order_id: paymentResponse.data.id, // Razorpay Order ID
                handler: async function (response: any) {
                    try {
                        // 2. Payment Successful - Now Create Order in DB
                        const orderData = {
                            orderItems: items.map((item) => ({
                                product: item.productId,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                image: item.image,
                            })),
                            shippingAddress: {
                                fullName: selectedAddress.fullName || user?.name || 'Guest',
                                phone: selectedAddress.phone,
                                address: selectedAddress.street,
                                city: selectedAddress.city,
                                state: selectedAddress.state,
                                country: selectedAddress.country,
                                zipCode: selectedAddress.zipCode,
                            },
                            paymentMethod: 'razorpay',
                            itemsPrice: subtotal,
                            taxPrice: tax,
                            shippingPrice: shipping,
                            totalPrice: total,
                            paymentResult: {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            }
                        };

                        await createOrder.mutateAsync(orderData);
                        clearCart();
                        router.push('/payment/success');
                    } catch (error: any) {
                        console.error('Order creation failed after payment:', error);
                        toast.error(`Order Creation Failed: ${error?.response?.data?.message || 'Unknown error'}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
                        // Optionally redirect to a specific error page or keep them here
                    }
                },
                prefill: {
                    name: selectedAddress?.fullName || user?.name,
                    email: user?.email,
                    contact: selectedAddress?.phone,
                },
                config: {
                    display: {
                        blocks: {
                            magic: {
                                name: 'OTP Verification',
                                instruments: [
                                    {
                                        method: 'card',
                                    },
                                    {
                                        method: 'upi',
                                    },
                                ],
                            },
                        },
                        sequence: ['block.magic'],
                        preferences: {
                            show_default_blocks: true,
                        },
                    },
                },
                magic: true, // Enable Razorpay Magic Checkout
                shipping_address: true, // Explicitly request shipping address collection
                theme: {
                    color: '#3B82F6',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Payment initiation failed:', error);

            // Check if it's a product availability error
            if (error?.response?.data?.unavailableProducts || error?.response?.data?.outOfStockProducts) {
                const errorData = error.response.data;

                // Display detailed error message
                if (errorData.details) {
                    toast.error(errorData.details, {
                        duration: 6000,
                    });
                } else {
                    toast.error(errorData.message || 'Some products are not available');
                }

                // Redirect to cart to review items
                setTimeout(() => {
                    router.push('/cart');
                }, 3000);
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to initiate payment. Please try again.';
                toast.error(errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (items.length === 0) {
        router.push('/cart');
        return null;
    }

    if (checkoutMode === 'guest' && !selectedAddress) {
        return (
            <div className="container mx-auto px-4 py-12">
                <button
                    onClick={() => setCheckoutMode('choice')}
                    className="flex items-center text-sm text-zinc-500 mb-4 hover:text-zinc-800"
                >
                    ← Back to options
                </button>
                <GuestAddressForm
                    onSubmit={(addr) => setSelectedAddress(addr)}
                    onBack={() => setCheckoutMode('choice')}
                />
            </div>
        );
    }

    if (checkoutMode === 'choice') {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center">Checkout Options</h1>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/login?redirect=/checkout')}>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                                <LogIn className="h-6 w-6" />
                            </div>
                            <CardTitle>Sign In</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-zinc-500">
                            Already have an account? Sign in to use your saved addresses and track orders.
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push('/register?redirect=/checkout')}>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <CardTitle>Register</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-zinc-500">
                            New here? Create an account for a faster checkout experience next time.
                        </CardContent>
                    </Card>

                    <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => setCheckoutMode('guest')}>
                        <CardHeader className="text-center">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                                <User className="h-6 w-6" />
                            </div>
                            <CardTitle>Guest Checkout</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-zinc-500">
                            No account? No problem. Quick checkout with mobile verification.
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Shipping Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AddressSelector
                                addresses={user?.addresses || []}
                                selectedAddress={selectedAddress}
                                onSelect={setSelectedAddress}
                            />
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {items.map((item) => (
                                <div key={item.productId} className="flex justify-between text-sm">
                                    <span>
                                        {item.name} × {item.quantity}
                                    </span>
                                    <span className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
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
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                                </div>
                            </div>
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing || !selectedAddress}
                                size="lg"
                                className="w-full"
                            >
                                {isProcessing ? 'Processing...' : 'Pay Now'}
                            </Button>
                            <p className="text-xs text-center text-zinc-500">
                                Secure payment powered by Razorpay
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Load Razorpay Script */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </div>
    );
}
