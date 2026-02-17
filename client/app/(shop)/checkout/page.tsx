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
                        console.log("=== RAZORPAY PAYMENT RESPONSE ===");
                        console.log("Payment ID:", response.razorpay_payment_id);
                        console.log("Order ID:", response.razorpay_order_id);
                        console.log("=================================");

                        let finalShippingAddress = selectedAddress;
                        let razorpayAddress = null;

                        // If no address selected (guest checkout), fetch from Razorpay order details
                        if (!finalShippingAddress) {
                            try {
                                console.log("Fetching shipping address from Razorpay order...");
                                const { data: orderDetails } = await api.get(`/payment/order/${response.razorpay_order_id}`);

                                console.log("Razorpay Order Details Response:", orderDetails);

                                if (orderDetails.success && orderDetails.data.shippingAddress) {
                                    razorpayAddress = orderDetails.data.shippingAddress;
                                    console.log("Successfully extracted address:", razorpayAddress);
                                } else {
                                    console.warn("No shipping address found in Razorpay order");
                                }
                            } catch (err) {
                                console.error("Failed to fetch Razorpay order details:", err);
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
                magic: false,
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
            <OrderSuccessModal isOpen={showSuccessModal} orderId={createdOrderId} isGuest={!isAuthenticated} />

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

                            <div className="space-y-6 max-w-lg mx-auto text-center py-8">
                                <h3 className="text-xl font-semibold">Guest Checkout</h3>
                                <p className="text-muted-foreground mb-6">
                                    You will be asked to enter your shipping details securely during payment.
                                </p>

                                <Button
                                    onClick={() => handlePayment(true)}
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-auto py-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center text-lg mb-1">
                                            <Zap className="w-5 h-5 mr-2 fill-current" />
                                            Proceed to Secure Checkout
                                        </div>
                                        <span className="text-xs opacity-90 font-normal">Enter address & pay via Razorpay</span>
                                    </div>
                                </Button>
                            </div>
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
