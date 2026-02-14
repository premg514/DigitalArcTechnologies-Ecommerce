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
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import Image from 'next/image';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [returnReason, setReturnReason] = useState('');
    const [isReturning, setIsReturning] = useState(false);
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

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

    const handleCancelOrder = async () => {
        if (!confirm('Are you sure you want to cancel this order? If paid, a refund will be initiated.')) {
            return;
        }

        try {
            setIsCancelling(true);
            await api.put(`/orders/${id}/cancel`);
            await queryClient.invalidateQueries({ queryKey: ['order', id] });
            toast.success('Order cancelled successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReturnOrder = async () => {
        if (!returnReason) {
            toast.error('Please provide a reason for return');
            return;
        }

        try {
            setIsReturning(true);
            await api.put(`/orders/${id}/return`, { reason: returnReason });
            await queryClient.invalidateQueries({ queryKey: ['order', id] });
            toast.success('Return request submitted successfully');
            setIsReturnDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit return request');
        } finally {
            setIsReturning(false);
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

    const canReturn = order.orderStatus === 'delivered' && (!order.returnRequest || order.returnRequest.status === 'none');

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
                        {['pending', 'processing'].includes(order.orderStatus) && (
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
                                    'Cancel'
                                )}
                            </Button>
                        )}
                        {canReturn && (
                            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                                        Return Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Request Return</DialogTitle>
                                        <DialogDescription>
                                            Please let us know why you want to return this item.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Reason for Return</Label>
                                            <Select onValueChange={setReturnReason}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="defective">Defective/Damaged</SelectItem>
                                                    <SelectItem value="incorrect_item">Incorrect Item Received</SelectItem>
                                                    <SelectItem value="quality_issue">Quality Not as Expected</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {returnReason === 'other' && (
                                            <div className="space-y-2">
                                                <Label>Additional Comments</Label>
                                                <Textarea
                                                    placeholder="Please provide more details..."
                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>Cancel</Button>
                                        <Button onClick={handleReturnOrder} disabled={isReturning}>
                                            {isReturning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Submit Request
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
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


                {/* Return Status Banner */}
                {order.returnRequest && order.returnRequest.status !== 'none' && (
                    <Card className={`border-l-4 ${order.returnRequest.status === 'pending' ? 'border-l-yellow-500 bg-yellow-50' :
                        order.returnRequest.status === 'approved' ? 'border-l-green-500 bg-green-50' :
                            'border-l-red-500 bg-red-50'
                        }`}>
                        <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2">Return Request: {order.returnRequest.status.toUpperCase()}</h3>
                            <p className="text-sm">Reason: {order.returnRequest.reason}</p>
                            {order.returnRequest.adminComment && (
                                <p className="text-sm mt-1 font-medium">Admin Comment: {order.returnRequest.adminComment}</p>
                            )}
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
                                    {order.orderItems.length} items in this order
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.orderItems.map((item: any) => (
                                        <div key={item._id} className="flex items-center gap-4 py-2 border-b last:border-0">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                                                {item.image && (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-zinc-500">
                                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
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
                                        <span>Total</span>
                                        <span>{formatCurrency(order.totalPrice)}</span>
                                    </div>
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
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.zipCode}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                    {order.shippingAddress.phone && (
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
