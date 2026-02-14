'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to checkout as this is not a valid payment page
        router.push('/checkout');
    }, [router]);

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <p>Redirecting to checkout...</p>
        </div>
    );
}
