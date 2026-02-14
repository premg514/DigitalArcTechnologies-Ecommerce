import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ENDPOINTS, ITEMS_PER_PAGE } from '@/lib/constants';
import type { Product, ProductsResponse, ProductFilters } from '@/types/product';

// Get all products with filters
export const useProducts = (filters?: ProductFilters) => {
    return useQuery<ProductsResponse>({
        queryKey: ['products', filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters?.category) params.append('category', filters.category);
            if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters?.search) params.append('search', filters.search);
            if (filters?.sort) params.append('sort', filters.sort);
            params.append('page', (filters?.page || 1).toString());
            params.append('limit', (filters?.limit || ITEMS_PER_PAGE).toString());

            const { data } = await api.get(`${API_ENDPOINTS.PRODUCTS}?${params}`);
            return { ...data, products: data.data };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Get single product by ID
export const useProduct = (id: string) => {
    return useQuery<Product>({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(API_ENDPOINTS.PRODUCT_BY_ID(id));
            return data.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Get featured products
export const useFeaturedProducts = () => {
    return useQuery<Product[]>({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const { data } = await api.get(`${API_ENDPOINTS.PRODUCTS}?isFeatured=true&limit=8`);
            return data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Create product review
export const useCreateReview = (productId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reviewData: { rating: number; comment: string }) => {
            const { data } = await api.post(
                `${API_ENDPOINTS.PRODUCT_BY_ID(productId)}/reviews`,
                reviewData
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
        },
    });
};
