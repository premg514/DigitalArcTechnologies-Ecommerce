'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useForgotPassword } from '@/hooks/useAuth';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const forgotPassword = useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            await forgotPassword.mutateAsync(email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        disabled={forgotPassword.isPending}
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={forgotPassword.isPending}
                            >
                                {forgotPassword.isPending ? 'Sending Link...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold">Check your email</h3>
                            <p className="text-sm text-muted-foreground">
                                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                            </p>
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try another email
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
