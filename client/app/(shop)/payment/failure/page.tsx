'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <Card className="max-w-md mx-auto text-center">
                <CardHeader>
                    <div className="mx-auto mb-4">
                        <XCircle className="h-16 w-16 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl">Payment Failed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Unfortunately, your payment could not be processed.
                    </p>
                    <p className="text-sm text-zinc-500">
                        Please try again or contact support if the problem persists.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Link href="/checkout" className="w-full">
                        <Button className="w-full">Try Again</Button>
                    </Link>
                    <Link href="/cart" className="w-full">
                        <Button variant="outline" className="w-full">
                            Back to Cart
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
