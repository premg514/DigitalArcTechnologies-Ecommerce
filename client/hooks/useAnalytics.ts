'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    recentOrders: any[];
    lowStockProducts: any[];
    salesData: { date: string; revenue: number }[];
    topProducts: any[];
}

export function useAnalytics(dateRange?: { from: Date; to: Date }) {
    return useQuery({
        queryKey: ['analytics', dateRange],
        queryFn: async () => {
            const params = dateRange
                ? {
                    from: dateRange.from.toISOString(),
                    to: dateRange.to.toISOString(),
                }
                : {};

            const { data } = await api.get<AnalyticsData>('/admin/analytics', { params });
            return data;
        },
    });
}

export function useAdminStats() {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/analytics');
            const stats = data.data;
            return {
                totalRevenue: stats.revenue.total,
                revenueTrend: 0,
                totalOrders: stats.orders.total,
                ordersTrend: 0,
                totalProducts: stats.products.total,
                totalUsers: stats.users.total,
                usersTrend: 0,
                recentOrders: stats.recentOrders,
                lowStockProducts: stats.lowStockProducts,
            };
        },
        refetchInterval: 5000, // Update every 5 seconds for "lively" dashboard
    });
}
