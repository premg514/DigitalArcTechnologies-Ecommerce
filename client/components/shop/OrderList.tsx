'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types/order';
import { ChevronRight, Filter, Search, Eye } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

interface OrderListProps {
    orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
    const router = useRouter();
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500 mb-4">No orders found.</p>
                <Link href="/">
                    <Button variant="outline">Start Shopping</Button>
                </Link>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-600';
            case 'processing':
                return 'text-blue-600';
            case 'shipped':
                return 'text-purple-600';
            case 'cancelled':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const filteredOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();

        // Search Filter
        const searchMatch =
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!searchMatch) return false;

        // Time Filter
        if (filterType === 'last3months') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(now.getMonth() - 3);
            return orderDate >= threeMonthsAgo;
        }
        if (filterType === '2025') {
            return orderDate.getFullYear() === 2025;
        }
        if (filterType === '2026') {
            return orderDate.getFullYear() === 2026;
        }

        return true; // 'all'
    });

    return (
        <div className="space-y-4">
            {/* Filters Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-zinc-500" />
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="last3months">Last 3 Months</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mobile Card View (Hidden on larger screens) */}
            <div className="block md:hidden space-y-3">
                {filteredOrders.map((order) => {
                    const firstItem = order.orderItems[0];
                    const otherItemsCount = order.orderItems.length - 1;

                    return (
                        <div
                            key={order._id}
                            onClick={() => router.push(`/orders/${order._id}`)}
                            className="bg-white p-4 rounded-lg border shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="flex gap-4">
                                <div className="h-20 w-20 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                        src={firstItem.image}
                                        alt={firstItem.name}
                                        className="object-cover h-full w-full"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate text-zinc-900">{firstItem.name}</h3>
                                    {otherItemsCount > 0 && (
                                        <p className="text-xs text-zinc-500 mb-1">
                                            + {otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                                        </p>
                                    )}
                                    <p className={`text-xs font-medium ${getStatusColor(order.orderStatus)} capitalize mb-1`}>
                                        {order.orderStatus}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                                <span className="text-zinc-600">Total Amount</span>
                                <span className="font-bold text-zinc-900">{formatPrice(order.totalPrice)}</span>
                            </div>
                        </div>
                    )
                })}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                        No orders match your filter.
                    </div>
                )}
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50">
                        <TableRow>
                            <TableHead className="w-[120px]">Order ID</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.map((order) => {
                            const firstItem = order.orderItems[0];
                            const otherItemsCount = order.orderItems.length - 1;

                            return (
                                <TableRow
                                    key={order._id}
                                    className="cursor-pointer hover:bg-zinc-50 transition-colors"
                                    onClick={() => router.push(`/orders/${order._id}`)}
                                >
                                    <TableCell className="font-medium text-zinc-500 text-xs">
                                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 relative rounded border overflow-hidden bg-white flex-shrink-0">
                                                <img
                                                    src={firstItem.image}
                                                    alt={firstItem.name}
                                                    className="object-cover h-full w-full"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1">{firstItem.name}</p>
                                                {otherItemsCount > 0 && (
                                                    <p className="text-xs text-zinc-500">
                                                        + {otherItemsCount} more item{otherItemsCount > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{formatPrice(order.totalPrice)}</TableCell>
                                    <TableCell>
                                        <span className={`text-sm font-medium capitalize ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">
                                    No orders match your filter.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
