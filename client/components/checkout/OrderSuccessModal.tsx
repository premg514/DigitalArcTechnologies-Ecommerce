'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
    isOpen: boolean;
    orderId?: string;
    isGuest: boolean;
}

export default function OrderSuccessModal({ isOpen, orderId, isGuest }: OrderSuccessModalProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isOpen && !isGuest) { // Only countdown if NOT guest
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                router.push('/orders');
            }
        }
    }, [isOpen, countdown, router, isGuest]);

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            {/* Forced Light Background as requested */}
            <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-white text-zinc-900">
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {/* Animated Checkmark Circle */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-green-500 rounded-full p-6 shadow-lg shadow-green-500/30 transform transition-all duration-700 hover:scale-110">
                            <Check className="w-8 h-8 text-white stroke-[3] animate-[spin_0.5s_ease-out_reverse]" style={{ animationIterationCount: 1 }} />
                        </div>
                    </div>

                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-zinc-900">
                            Order Confirmed!
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 max-w-[280px] mx-auto text-base">
                            Thank you for your purchase. Your order has been placed successfully.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Redirect Info OR Success Message */}
                    <div className="bg-zinc-50 rounded-lg p-4 w-full border border-zinc-100">
                        {!isGuest ? (
                            <>
                                <p className="text-sm text-zinc-600 mb-1">Redirecting to orders in</p>
                                <p className="text-3xl font-bold text-blue-600 tabular-nums">{countdown}</p>
                            </>
                        ) : (
                            <p className="text-sm text-zinc-600 font-medium">
                                A confirmation email has been sent to you.
                            </p>
                        )}
                    </div>

                    <div className="w-full space-y-3">
                        {!isGuest && (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-11 text-base"
                                onClick={() => router.push('/orders')}
                            >
                                View Order Details
                            </Button>
                        )}
                        {isGuest && orderId && (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg h-11 text-base"
                                onClick={() => window.open(`/api/orders/${orderId}/receipt`, '_blank')}
                            >
                                Download Receipt
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-500 hover:text-zinc-900"
                            onClick={() => router.push('/')}
                        >
                            Continue Shopping <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
