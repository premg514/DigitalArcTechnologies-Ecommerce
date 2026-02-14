'use client';

import { useAdminStats } from '@/hooks/useAnalytics';
import StatCard from '@/components/admin/StatCard';
import { Card } from '@/components/ui/card';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    AlertTriangle,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                    Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back! Here's what's happening with your store.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    icon={DollarSign}
                    trend={stats?.revenueTrend !== undefined ? { value: stats.revenueTrend, isPositive: stats.revenueTrend >= 0 } : undefined}
                />
                <StatCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    icon={ShoppingCart}
                    trend={stats?.ordersTrend !== undefined ? { value: stats.ordersTrend, isPositive: stats.ordersTrend >= 0 } : undefined}
                />
                <StatCard
                    title="Total Products"
                    value={stats?.totalProducts || 0}
                    icon={Package}
                />
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={Users}
                    trend={stats?.usersTrend !== undefined ? { value: stats.usersTrend, isPositive: stats.usersTrend >= 0 } : undefined}
                />
            </div>

            {/* Recent Orders & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="p-6 border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-heading font-semibold text-foreground">
                            Recent Orders
                        </h2>
                        <Link href="/admin/orders">
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            stats.recentOrders.slice(0, 5).map((order: any) => (
                                <div
                                    key={order._id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            Order #{order._id.slice(-6).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.user?.name || 'Guest'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">
                                            ₹{order.totalPrice}
                                        </p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sage-muted py-8">No recent orders</p>
                        )}
                    </div>
                </Card>

                {/* Low Stock Products */}
                <Card className="p-6 border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-accent" />
                            Low Stock Alert
                        </h2>
                        <Link href="/admin/products">
                            <Button variant="outline" size="sm">
                                Manage
                            </Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                            stats.lowStockProducts.slice(0, 5).map((product: any) => (
                                <div
                                    key={product._id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">
                                            {product.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {product.category}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-accent">
                                            {product.stock} left
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sage-muted py-8">
                                All products are well stocked
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 border-border">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/products/new">
                        <Button className="w-full" size="lg">
                            <Package className="mr-2 h-4 w-4" />
                            Add New Product
                        </Button>
                    </Link>
                    <Link href="/admin/orders">
                        <Button variant="outline" className="w-full" size="lg">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Orders
                        </Button>
                    </Link>
                    <Link href="/admin/analytics">
                        <Button variant="outline" className="w-full" size="lg">
                            <DollarSign className="mr-2 h-4 w-4" />
                            View Analytics
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
