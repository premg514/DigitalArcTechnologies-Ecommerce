'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <Card className="max-w-md mx-auto text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment Successful!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Thank you for your order. Your payment has been processed successfully.
                    </p>
                    <p className="text-sm text-zinc-500">
                        You will receive an email confirmation shortly with your order details.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Link href="/orders" className="w-full">
                        <Button className="w-full">View My Orders</Button>
                    </Link>
                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full">
                            Continue Shopping
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
