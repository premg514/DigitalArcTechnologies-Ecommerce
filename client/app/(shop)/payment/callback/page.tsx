'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to orders page as callback is handled in checkout
        router.push('/orders');
    }, [router]);

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p>Processing...</p>
        </div>
    );
}
