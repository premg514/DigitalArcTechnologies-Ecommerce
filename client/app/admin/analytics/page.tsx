'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export default function AnalyticsPage() {
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['admin-analytics'],
        queryFn: async () => {
            const { data } = await api.get('/admin/analytics');
            return data.data;
        },
    });

    <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>

    // Calculate max revenue for bar chart scaling
    const maxRevenue = Math.max(
        ...(analytics?.revenue?.monthly?.map((m: any) => m.revenue) || [0])
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                    Detailed insights into your store performance.
                </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Order Status</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 mt-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Delivered</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{analytics?.orders?.delivered || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Processing</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{analytics?.orders?.processing || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending</span>
                                <span className="font-bold text-accent">{analytics?.orders?.pending || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Cancelled</span>
                                <span className="font-bold text-primary">{analytics?.orders?.cancelled || 0}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customer Growth</CardTitle>
                        <Users className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{analytics?.users?.total || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total registered users</p>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-foreground mb-2">Recent Joiners</p>
                            {analytics?.users?.recent?.slice(0, 3).map((user: any) => (
                                <div key={user._id} className="flex justify-between text-xs">
                                    <span className="text-muted-foreground truncate max-w-[120px]">{user.name}</span>
                                    <span className="text-muted-foreground/60">{new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Financials</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{formatCurrency(analytics?.revenue?.total || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total lifetime revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Revenue Chart (CSS only) */}
            <Card>
                <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-end justify-between gap-2 pt-4">
                        {analytics?.revenue?.monthly?.length > 0 ? (
                            analytics.revenue.monthly.map((item: any) => (
                                <div key={`${item._id.year}-${item._id.month}`} className="flex flex-col items-center flex-1 group">
                                    <div className="relative w-full flex justify-center items-end h-[160px] bg-muted rounded-t-sm overflow-hidden">
                                        <div
                                            className="w-full bg-secondary hover:bg-secondary-dark transition-all duration-500 rounded-t-sm mx-1"
                                            style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                                {formatCurrency(item.revenue)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-2">
                                        {new Date(0, item._id.month - 1).toLocaleString('default', { month: 'short' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics?.products?.topSelling?.length > 0 ? (
                            analytics.products.topSelling.map((product: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm text-muted-foreground">
                                        #{index + 1}
                                    </div>
                                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                        {product.image?.url && (
                                            <Image
                                                src={product.image.url}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Sold: {product.totalQuantity} units
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-foreground">
                                            {formatCurrency(product.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">No sales data yet</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
