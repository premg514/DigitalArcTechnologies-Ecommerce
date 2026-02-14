import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { User, AuthResponse, LoginCredentials, RegisterData } from '@/types/user';

// Get current user
export const useUser = () => {
    return useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');

            const { data } = await api.get(API_ENDPOINTS.ME);
            return data.data;
        },
        retry: 1, // Retry once to handle transient network errors
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Login mutation
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, LoginCredentials>({
        mutationFn: async (credentials) => {
            const { data } = await api.post(API_ENDPOINTS.LOGIN, credentials);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.data.token);
            queryClient.setQueryData(['user'], data.data);
        },
    });
};

// Register mutation
export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse, Error, RegisterData>({
        mutationFn: async (userData) => {
            const { data } = await api.post(API_ENDPOINTS.REGISTER, userData);
            return data;
        },
        onSuccess: (data) => {
            localStorage.setItem('token', data.data.token);
            queryClient.setQueryData(['user'], data.data);
        },
    });
};

// Logout mutation
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await api.post(API_ENDPOINTS.LOGOUT);
        },
        onSuccess: () => {
            localStorage.removeItem('token');
            queryClient.setQueryData(['user'], null);
            queryClient.clear();
        },
    });
};

// Check if user is authenticated
export const useAuth = () => {
    const { data: user, isLoading } = useUser();
    const logoutMutation = useLogout();

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin: user?.role === 'admin',
        logout: logoutMutation.mutate,
    };
};
