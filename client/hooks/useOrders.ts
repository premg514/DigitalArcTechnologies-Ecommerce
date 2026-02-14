import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Order, OrdersResponse, CreateOrderData } from '@/types/order';

// Get user's orders
export const useMyOrders = (params?: { page?: number; limit?: number }) => {
    return useQuery<OrdersResponse>({
        queryKey: ['orders', 'my-orders', params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const { data } = await api.get(`${API_ENDPOINTS.MY_ORDERS}?${queryParams.toString()}`);
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get single order by ID
export const useOrder = (id: string) => {
    return useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            const { data } = await api.get(API_ENDPOINTS.ORDER_BY_ID(id));
            return data.data;
        },
        enabled: !!id,
    });
};

// Create new order
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<Order, Error, CreateOrderData>({
        mutationFn: async (orderData) => {
            const { data } = await api.post(API_ENDPOINTS.ORDERS, orderData);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

// Get all orders (admin)
export const useAllOrders = () => {
    return useQuery<OrdersResponse>({
        queryKey: ['orders', 'all'],
        queryFn: async () => {
            const { data } = await api.get(API_ENDPOINTS.ADMIN_ORDERS);
            return data;
        },
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

// Update order status (admin)
export const useUpdateOrderStatus = (orderId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (status: string) => {
            const { data } = await api.patch(
                `${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/status`,
                { status }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        },
    });
};
