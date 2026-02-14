'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { Search, Eye, Filter, Loader2, Download } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = [
    'All',
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export default function AdminOrdersPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('All');

    const [limit, setLimit] = useState(10);

    // Note: Backend might not support search by order ID yet in getAllOrders
    // For now we'll stick to pagination and status filtering

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', page, status, limit],
        queryFn: async () => {
            const params: any = {
                page,
                limit,
                sort: '-createdAt',
            };

            if (status !== 'All') {
                params.status = status.toLowerCase();
            }

            const { data } = await api.get('/admin/orders', { params });
            return data;
        },
    });

    const queryClient = useQueryClient();



    const handleExport = async () => {
        try {
            const { data } = await api.get('/admin/orders?limit=1000'); // Fetch all/most orders
            const orders = data.data;

            if (!orders || orders.length === 0) {
                toast.error('No orders to export');
                return;
            }

            // Prepare data for Excel
            const excelData = orders.map((order: any) => ({
                'Order ID': order._id,
                'Customer Name': order.user?.name || 'Guest',
                'Email': order.user?.email || order.shippingAddress.email,
                'Date': new Date(order.createdAt).toLocaleDateString(),
                'Total': order.totalPrice,
                'Payment Status': order.isPaid ? 'Paid' : 'Unpaid',
                'Order Status': order.orderStatus,
                'Address': `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}`,
                'Phone': order.shippingAddress.phone
            }));

            // Dynamically import xlsx
            const xlsxModule = await import('xlsx');
            // Check if it has a default export (common in some bundlers) or named exports
            const XLSX = xlsxModule.default || xlsxModule;

            if (!XLSX.utils || !XLSX.writeFile) {
                throw new Error('XLSX library not loaded correctly');
            }

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

            // Generate Excel file
            XLSX.writeFile(workbook, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success('Orders exported to Excel successfully');
        } catch (error: any) {
            console.error('Export failed', error);
            toast.error(`Failed to export orders: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="space-y-6 pt-12 md:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary">
                    Orders
                </h1>
                <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export Excel
                </Button>
            </div>

            <div className="bg-card p-2 rounded-lg shadow-sm border border-border overflow-x-auto no-scrollbar">
                <Tabs defaultValue="All" className="w-full" onValueChange={(val) => { setStatus(val); setPage(1); }}>
                    <TabsList className="flex w-max min-w-full h-auto bg-transparent gap-1 p-1">
                        {STATUS_OPTIONS.map((option) => (
                            <TabsTrigger
                                key={option}
                                value={option}
                                className="capitalize px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:!text-white border border-transparent data-[state=active]:border-primary"
                            >
                                {option.replace('_', ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
                {/* Mobile View */}
                <div className="md:hidden divide-y divide-border">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        data?.data?.map((order: any) => (
                            <Link
                                href={`/admin/orders/${order._id}`}
                                key={order._id}
                                className="block p-4 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-mono text-sm font-bold text-foreground">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                    <OrderStatusBadge status={order.orderStatus} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {order.user?.name || 'Guest User'}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold text-primary">
                                            {formatCurrency(order.totalPrice)}
                                        </p>
                                        <span
                                            className={cn(
                                                "text-xs px-2 py-0.5 rounded-full font-semibold",
                                                order.isPaid
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-secondary/10 text-secondary'
                                            )}
                                        >
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((order: any) => (
                                    <TableRow
                                        key={order._id}
                                        className="cursor-pointer hover:bg-muted/50 transition-colors group"
                                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                                    >
                                        <TableCell className="font-medium font-mono">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            {order.user ? (
                                                <div>
                                                    <p className="font-medium text-foreground">{order.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Guest User</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                                        <TableCell className="font-bold text-primary">{formatCurrency(order.totalPrice)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-semibold",
                                                    order.isPaid
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-secondary/10 text-secondary'
                                                )}
                                            >
                                                {order.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge status={order.orderStatus} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/orders/${order._id}`}>
                                                <Button variant="ghost" size="sm" className="hover:text-primary">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {data?.pages > 1 && (
                <div className="flex items-center justify-end gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-sage-muted">Items per page:</span>
                        <Select
                            value={String(limit)}
                            onValueChange={(val) => {
                                setLimit(Number(val));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder={String(limit)} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <div className="text-sm font-medium">
                            Page {page} of {data.pages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                            disabled={page === data.pages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
