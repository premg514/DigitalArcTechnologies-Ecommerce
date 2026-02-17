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
}

export default function OrderSuccessModal({ isOpen, orderId }: OrderSuccessModalProps) {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (isOpen && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isOpen && countdown === 0) {
            router.push('/orders');
        }
    }, [isOpen, countdown, router]);

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-white dark:bg-zinc-900">
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {/* Animated Checkmark Circle */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-green-500 rounded-full p-6 shadow-lg shadow-green-500/30 transform transition-all duration-700 hover:scale-110">
                            <Check className="w-8 h-8 text-white stroke-[3] animate-[spin_0.5s_ease-out_reverse]" style={{ animationIterationCount: 1 }} />
                        </div>
                    </div>

                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            Order Confirmed!
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto text-base">
                            Thank you for your purchase. Your order has been placed successfully.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 w-full border border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Redirecting to orders in</p>
                        <p className="text-3xl font-bold text-primary tabular-nums">{countdown}</p>
                    </div>

                    <div className="w-full space-y-3">
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 text-base"
                            onClick={() => router.push('/orders')}
                        >
                            View Order Details
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
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
