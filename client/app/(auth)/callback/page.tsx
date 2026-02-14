'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            // Handle error
            router.push(`/login?error=${error}`);
            return;
        }

        if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token);

            // Redirect to home page
            router.push('/');
        } else {
            // No token, redirect to login
            router.push('/login');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
