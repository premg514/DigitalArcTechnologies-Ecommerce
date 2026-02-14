'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMyOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, User as UserIcon, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const { data: response, isLoading: ordersLoading } = useMyOrders({ page: 1, limit: 10 });
    const orders = response?.data || [];

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h2 className="text-2xl font-bold">Please sign in to view your profile</h2>
                <Link href="/login">
                    <Button>Sign In</Button>
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Profile Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-lg">{user.name}</p>
                                    <p className="text-sm text-zinc-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Address
                                </h3>
                                {user.addresses && user.addresses.length > 0 ? (
                                    <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                        {(() => {
                                            const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
                                            return (
                                                <>
                                                    <p>{defaultAddress.street}</p>
                                                    <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}</p>
                                                    <p>{defaultAddress.country}</p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500 italic">No address saved</p>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => logout && logout()}
                            >
                                Sign Out
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Order History */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                My Orders
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {ordersLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                    <p className="text-zinc-500 mb-4">You haven't placed any orders yet</p>
                                    <Link href="/">
                                        <Button className="mt-4 bg-secondary hover:bg-secondary-dark text-white">
                                            Start Shopping
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.slice(0, 4).map((order: any) => (
                                        <div
                                            key={order._id}
                                            className="border rounded-lg p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</span>
                                                        <Badge className={getStatusColor(order.orderStatus)}>
                                                            {order.orderStatus}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(order.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(order.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-lg">{formatCurrency(order.totalPrice)}</p>
                                                    <p className="text-xs text-zinc-500">{order.orderItems.length} items</p>
                                                    <Link href={`/orders/${order._id}`}>
                                                        <Button variant="link" className="px-0 h-auto text-sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {order.orderItems.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        <div className="relative h-12 w-12 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                                                            {item.image && (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {orders.length > 4 && (
                                        <div className="text-center pt-2">
                                            <Link href="/orders">
                                                <Button variant="outline" className="w-full sm:w-auto">
                                                    View All Orders
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
