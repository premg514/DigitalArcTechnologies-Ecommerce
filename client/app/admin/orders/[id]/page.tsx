'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Mail, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentLocation, setCurrentLocation] = useState('');

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['admin-order', id],
        queryFn: async () => {
            const { data } = await api.get(`/orders/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, location }: { status: string; location?: string }) => {
            await api.put(`/orders/${id}/status`, { status, currentLocation: location });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            toast.success('Order status updated successfully');
            setCurrentLocation(''); // Clear the input field
            setIsUpdating(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
            setIsUpdating(false);
        },
    });

    const handleStatusChange = (newStatus: string) => {
        if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            setIsUpdating(true);
            updateStatusMutation.mutate({ status: newStatus, location: currentLocation || undefined });
        }
    };



    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex flex-wrap items-center gap-2 sm:gap-3">
                            Order #{order?._id?.slice(-6).toUpperCase()}
                            <OrderStatusBadge status={order.orderStatus} />
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

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
                                    <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 border-b last:border-0">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                                                <p className="font-medium text-foreground truncate">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right pl-20 sm:pl-0">
                                            <p className="font-semibold text-foreground">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="text-foreground">{formatCurrency(order.itemsPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-foreground">{formatCurrency(order.shippingPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span className="text-foreground">{formatCurrency(order.taxPrice)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-4 text-foreground">
                                    <span>Total Amount</span>
                                    <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                            <CardDescription>Change the current status of this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Location</label>
                                    <Input
                                        placeholder="E.g., Mumbai Hub, Out for Delivery"
                                        value={currentLocation}
                                        onChange={(e) => setCurrentLocation(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                                    <div className="w-full sm:w-[250px]">
                                        <Select
                                            value={order.orderStatus}
                                            onValueChange={handleStatusChange}
                                            disabled={isUpdating}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        variant="default"
                                        disabled={isUpdating}
                                        onClick={() => {
                                            if (currentLocation !== order.currentLocation) {
                                                setIsUpdating(true);
                                                updateStatusMutation.mutate({
                                                    status: order.orderStatus,
                                                    location: currentLocation
                                                });
                                            }
                                        }}
                                    >
                                        Update Location Only
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    {/* Timeline */}
                    {
                        order.timeline && order.timeline.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l-2 border-zinc-200 dark:border-zinc-800 ml-3 space-y-8">
                                        {order.timeline.slice().reverse().map((event: any, index: number) => (
                                            <div key={index} className="ml-6 relative">
                                                <div className="relative">
                                                    <div className="absolute -left-[32px] mt-1.5 h-3.5 w-3.5 rounded-full bg-primary z-10" />
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                        <h3 className="flex items-center text-base font-semibold text-foreground">
                                                            {event.status}
                                                        </h3>
                                                        <time className="text-xs font-normal leading-none text-muted-foreground">
                                                            {formatDate(event.timestamp)}
                                                        </time>
                                                    </div>
                                                    <p className="text-sm font-normal text-muted-foreground">
                                                        {event.comment}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    }
                </div>

                {/* Sidebar - Customer & Shipping Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {order.user?.name?.charAt(0) || 'G'}
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">
                                        {order.user?.name || order.shippingAddress?.fullName || 'Guest User'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.user?.email || 'No email provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-foreground">{order.shippingAddress.phone}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <address className="not-italic text-sm text-muted-foreground space-y-1">
                                <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            </address>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md border border-border">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <span
                                    className={
                                        order.isPaid
                                            ? 'text-green-600 dark:text-green-400 font-medium text-sm'
                                            : 'text-primary font-medium text-sm'
                                    }
                                >
                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <p className="text-foreground">Method: {order.paymentMethod}</p>
                                {order.paidAt && (
                                    <p>Paid on: {formatDate(order.paidAt)}</p>
                                )}
                                {order.paymentResult?.id && (
                                    <p className="text-xs break-all">ID: {order.paymentResult.id}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
