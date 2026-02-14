'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import Image from 'next/image';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const { data } = await api.get(`/orders/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    const queryClient = useQueryClient();
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel all eligible items in this order? If paid, a refund will be initiated for those items.')) {
            return;
        }

        try {
            setIsCancelling(true);
            await api.put(`/orders/${id}/cancel`);
            await queryClient.invalidateQueries({ queryKey: ['order', id] });
            toast.success('Eligible items cancelled successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleCancelItem = async (itemId: string) => {
        if (!confirm('Are you sure you want to cancel this item? If paid, a refund will be initiated.')) {
            return;
        }

        try {
            setCancellingItemId(itemId);
            await api.put(`/orders/${id}/items/${itemId}/cancel`);
            await queryClient.invalidateQueries({ queryKey: ['order', id] });
            toast.success('Item cancelled successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel item');
        } finally {
            setCancellingItemId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-red-600">Error loading order</h2>
                <p className="text-zinc-600 mt-2">The order could not be found or there was an error loading it.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                </Button>
            </div>
        );
    }

    const showBulkCancel = ['pending', 'processing'].includes(order.orderStatus) && order.isCancellable;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 w-full">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 sm:ml-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center gap-2 sm:gap-3">
                                <span className="hidden sm:inline">Order</span> #{order._id.slice(-6).toUpperCase()}
                                <OrderStatusBadge status={order.orderStatus} />
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 sm:mt-1">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        {showBulkCancel && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="flex-1 sm:flex-none"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Wait...
                                    </>
                                ) : (
                                    'Cancel Eligible Items'
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                {order.timeline && order.timeline.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-8">
                                {order.timeline.slice().reverse().map((event: any, index: number) => (
                                    <div key={index} className="ml-6 relative">
                                        <span className={`absolute -left-[36px] top-1 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white dark:ring-zinc-950 ${index === 0 ? 'bg-blue-600' : 'bg-blue-800 dark:bg-blue-900'}`}>
                                            <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-transparent'}`} />
                                        </span>
                                        <h3 className="flex items-center mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                            {event.status}
                                            {index === 0 && (
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded ml-3">
                                                    Latest
                                                </span>
                                            )}
                                        </h3>
                                        <time className="block mb-2 text-sm font-normal leading-none text-zinc-400 dark:text-zinc-500">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </time>
                                        <p className="text-base font-normal text-zinc-500 dark:text-zinc-400">
                                            {event.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Current Location Tracking */}
                {order.currentLocation && (
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Current Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-semibold text-blue-600">{order.currentLocation}</p>
                            <p className="text-sm text-zinc-500 mt-1">Your order is currently at this location</p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                                <CardDescription>
                                    {order.orderItems?.length || 0} items in this order
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.orderItems?.map((item: any) => (
                                        <div key={item._id} className={cn(
                                            "flex items-center gap-4 py-4 rounded-xl transition-all",
                                            item.isCancelled
                                                ? "bg-red-50/30 border border-primary/10 px-3"
                                                : "bg-white/50 border border-primary/5 px-3 hover:bg-white/80"
                                        )}>
                                            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-primary/10 shadow-sm">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                                {item.isCancelled && (
                                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-red-600 px-1.5 py-0.5 rounded shadow-sm">Cancelled</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className={cn(
                                                            "font-black text-primary text-base mb-0.5 leading-tight",
                                                            item.isCancelled && "line-through text-primary/60"
                                                        )}>
                                                            {item.name}
                                                        </p>
                                                        <p className="text-sm font-bold text-foreground/80">
                                                            Qty: {item.quantity} × {formatCurrency(item.price)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={cn(
                                                            "font-black text-primary text-base",
                                                            item.isCancelled && "text-primary/40"
                                                        )}>
                                                            {formatCurrency(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Individual Item Cancellation Button */}
                                                {!item.isCancelled && ['pending', 'processing'].includes(order.orderStatus) && (
                                                    <div className="mt-3 flex items-center justify-between">
                                                        {item.isCancellable ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-100 hover:border-red-200"
                                                                onClick={() => handleCancelItem(item._id)}
                                                                disabled={!!cancellingItemId}
                                                            >
                                                                {cancellingItemId === item._id ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                                                ) : 'Cancel Item'}
                                                            </Button>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-primary px-2.5 py-1 rounded shadow-sm">
                                                                Non-Cancellable
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {item.isCancelled && item.cancelledAt && (
                                                    <p className="text-[10px] text-red-500 font-medium mt-1">
                                                        Cancelled on {new Date(item.cancelledAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                        <span>{formatCurrency(order.itemsPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                                        <span>{formatCurrency(order.shippingPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Tax</span>
                                        <span>{formatCurrency(order.taxPrice)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Paid</span>
                                        <span>{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                    {order.orderItems.some((i: any) => i.isCancelled) && (
                                        <p className="text-xs text-secondary italic text-right mt-1">
                                            * Prices of cancelled items are automatically refunded to your original payment method.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Shipping Info & Payment Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <address className="not-italic text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                    <p className="font-bold text-foreground text-base mb-1">
                                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                                    </p>
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>
                                        {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                                    </p>
                                    <p>{order.shippingAddress?.country}</p>
                                    {order.shippingAddress?.phone && (
                                        <p className="mt-2">📞 {order.shippingAddress.phone}</p>
                                    )}
                                </address>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md border border-border">
                                    <span className="text-sm text-zinc-500">Status</span>
                                    <span
                                        className={
                                            order.isPaid
                                                ? 'text-green-600 font-medium text-sm'
                                                : 'text-yellow-600 font-medium text-sm'
                                        }
                                    >
                                        {order.isPaid ? 'Paid' : 'Unpaid'}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    <p>Method: {order.paymentMethod}</p>
                                    {order.paidAt && (
                                        <p>Paid on: {formatDate(order.paidAt)}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
