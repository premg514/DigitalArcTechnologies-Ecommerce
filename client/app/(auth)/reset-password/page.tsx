'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useResetPassword } from '@/hooks/useAuth';
import { Lock, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const resetPassword = useResetPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        try {
            await resetPassword.mutateAsync({
                token,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-500 text-center">Invalid Link</CardTitle>
                        <CardDescription className="text-center">
                            This password reset link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/forgot-password">
                            <Button variant="outline">Request New Link</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">
                        Please enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10"
                                        disabled={resetPassword.isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10"
                                        disabled={resetPassword.isPending}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={resetPassword.isPending}
                            >
                                {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold">Password Reset Successfully!</h3>
                            <p className="text-sm text-muted-foreground">
                                You have successfully reset your password. Redirecting you to home page...
                            </p>
                        </div>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link
                            href="/login"
                            className="flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 px-4">
                <Card className="w-full max-w-md p-8 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </Card>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
