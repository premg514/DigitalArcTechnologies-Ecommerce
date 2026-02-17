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
import OrderSuccessModal from '@/components/checkout/OrderSuccessModal';
import { Address } from '@/types/user';
import { LogIn, UserPlus, User, Zap } from 'lucide-react';

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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<string | undefined>();

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

    const checkPincode = async (pincode: string) => {
        try {
            const { data } = await api.get(`/pincodes/check/${pincode}`);
            return data.isAllowed;
        } catch (error) {
            console.error('Pincode check failed:', error);
            return false; // Fail safe
        }
    };

    const handlePayment = async (useMagicCheckout = false) => {
        // Validation: If NOT using Magic Checkout (pure guest flow), we need a local address
        if (!useMagicCheckout && !selectedAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        // Pincode Validation: Only if we have a local address selected
        if (!useMagicCheckout && selectedAddress) {
            const isAllowed = await checkPincode(selectedAddress.zipCode);
            if (!isAllowed) {
                toast.error(`Delivery is not available to ${selectedAddress.zipCode}. Please choose a different address.`);
                return;
            }
        }

        try {
            setIsProcessing(true);

            // 1. Create Razorpay order
            const { data: paymentResponse } = await api.post('/payment/create-order', {
                items: items,
                shippingPrice: shipping,
                taxPrice: tax
            });

            const options = {
                key: RAZORPAY_KEY,
                amount: paymentResponse.data.amount,
                currency: 'INR',
                name: 'Amrutha',
                description: 'Order Payment',
                order_id: paymentResponse.data.id,
                handler: async function (response: any) {
                    try {
                        let finalShippingAddress = selectedAddress;
                        let razorpayAddress = null;

                        // Try to extract address from Razorpay response (for Magic/Guest)
                        if (!finalShippingAddress && response.razorpay_shipping_address) {
                            try {
                                // Razorpay returns address as a JSON string
                                const parsedAddr = typeof response.razorpay_shipping_address === 'string'
                                    ? JSON.parse(response.razorpay_shipping_address)
                                    : response.razorpay_shipping_address;

                                razorpayAddress = {
                                    fullName: parsedAddr.name || 'Guest',
                                    phone: parsedAddr.contact || parsedAddr.phone || '9999999999',
                                    street: [parsedAddr.line1, parsedAddr.line2].filter(Boolean).join(', '),
                                    city: parsedAddr.city || 'Unknown',
                                    state: parsedAddr.state || 'Unknown',
                                    country: parsedAddr.country || 'India',
                                    zipCode: parsedAddr.zipcode || parsedAddr.pincode || '000000',
                                };
                            } catch (err) {
                                console.error("Failed to parse Razorpay address:", err);
                            }
                        }

                        // 2. Payment Successful - Create Order
                        const orderData = {
                            orderItems: items.map((item) => ({
                                product: item.productId,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                image: item.image,
                            })),
                            // Use selected address, OR extracted Razorpay address, OR fallback
                            shippingAddress: finalShippingAddress ? {
                                fullName: finalShippingAddress.fullName || user?.name || 'Guest',
                                phone: finalShippingAddress.phone,
                                address: finalShippingAddress.street,
                                city: finalShippingAddress.city,
                                state: finalShippingAddress.state,
                                country: finalShippingAddress.country,
                                zipCode: finalShippingAddress.zipCode,
                            } : (razorpayAddress ? {
                                fullName: razorpayAddress.fullName,
                                phone: razorpayAddress.phone,
                                address: razorpayAddress.street,
                                city: razorpayAddress.city,
                                state: razorpayAddress.state,
                                country: razorpayAddress.country,
                                zipCode: razorpayAddress.zipCode,
                            } : {
                                fullName: 'Razorpay Guest',
                                phone: '9999999999',
                                address: 'Address not provided by Razorpay',
                                city: 'Unknown',
                                state: 'Unknown',
                                country: 'India',
                                zipCode: '000000'
                            }),
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

                        const newOrder = await createOrder.mutateAsync(orderData);
                        setCreatedOrderId(newOrder._id);
                        clearCart();
                        // SHOW SUCCESS MODAL
                        setShowSuccessModal(true);

                    } catch (error: any) {
                        console.error('Order creation failed after payment:', error);
                        toast.error(`Order Creation Failed: ${error?.response?.data?.message || 'Unknown error'}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
                    }
                },
                prefill: {
                    name: selectedAddress?.fullName || user?.name,
                    email: user?.email,
                    contact: selectedAddress?.phone,
                },
                // Removed strict config to allow Magic to handle address/payment sequence naturally
                config: undefined,
                magic: true,
                // Only ask Razorpay to collect address if we don't have one
                shipping_address: !selectedAddress,
                theme: {
                    color: '#3B82F6',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error('Payment initiation failed:', error);
            if (error?.response?.data?.unavailableProducts || error?.response?.data?.outOfStockProducts) {
                const errorData = error.response.data;
                if (errorData.details) {
                    toast.error(errorData.details, { duration: 6000 });
                } else {
                    toast.error(errorData.message || 'Some products are not available');
                }
                setTimeout(() => { router.push('/cart'); }, 3000);
            } else {
                toast.error(error.response?.data?.message || 'Failed to initiate payment.');
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

    if (items.length === 0 && !showSuccessModal) {
        router.push('/cart');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <OrderSuccessModal isOpen={showSuccessModal} orderId={createdOrderId} />

            {checkoutMode === 'choice' ? (
                <div className="max-w-4xl mx-auto">
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
                                Sign in to use saved addresses and track orders.
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
                                Create an account for faster checkout.
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
                                Enter details manually for this order.
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-8 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or pay instantly</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => handlePayment(true)}
                            size="lg"
                            className="mt-6 w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                            <Zap className="w-4 h-4 mr-2 fill-current" />
                            Magic Checkout (Fast)
                        </Button>
                        <p className="text-xs text-zinc-500 mt-2">Use your saved numbers/cards via Razorpay</p>
                    </div>
                </div>
            ) : (
                <>
                    {checkoutMode === 'guest' && !selectedAddress && (
                        <div className="mb-8">
                            <button
                                onClick={() => setCheckoutMode('choice')}
                                className="text-sm text-zinc-500 hover:text-zinc-800 mb-4"
                            >
                                ← Back to options
                            </button>
                            {/* Magic Checkout Banner for Guest */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Want faster checkout?</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">Skip the forms and pay instantly with Razorpay Magic.</p>
                                </div>
                                <Button
                                    onClick={() => handlePayment(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Zap className="w-3 h-3 mr-1 fill-current" /> Magic Pay
                                </Button>
                            </div>
                            <GuestAddressForm
                                onSubmit={(addr) => setSelectedAddress(addr)}
                                onBack={() => setCheckoutMode('choice')}
                            />
                        </div>
                    )}

                    {/* Main Checkout UI (Address Selected or Authenticated) */}
                    {(checkoutMode === 'authenticated' || (checkoutMode === 'guest' && selectedAddress)) && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h1 className="text-3xl font-bold mb-8">Checkout</h1>
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
                                        {checkoutMode === 'guest' && (
                                            <Button variant="outline" size="sm" onClick={() => setSelectedAddress(undefined)} className="mt-4">
                                                Change Address
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>

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

                            <div className="lg:col-span-1">
                                <Card className="sticky top-20">
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-600 dark:text-zinc-400">Products Total</span>
                                            <span className="font-medium">{formatPrice(subtotal)}</span>
                                        </div>
                                        {/* Hiding Tax and Shipping as per user request to only show product price
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
                                    */}
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-semibold">Total Amount</span>
                                                <span className="text-2xl font-bold">{formatPrice(total)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handlePayment(false)}
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
                    )}
                </>
            )}

            <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        </div>
    );
}
