import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Address } from '@/types/user';

export const useAddress = () => {
    const queryClient = useQueryClient();

    const addAddress = useMutation({
        mutationFn: async (address: Omit<Address, '_id'>) => {
            const { data } = await api.post('/users/addresses', address);
            return data.data; // Returns updated addresses array
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], (old: any) => ({
                ...old,
                addresses: data,
            }));
        },
    });

    const updateAddress = useMutation({
        mutationFn: async ({ id, address }: { id: string; address: Partial<Address> }) => {
            const { data } = await api.put(`/users/addresses/${id}`, address);
            return data.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], (old: any) => ({
                ...old,
                addresses: data,
            }));
        },
    });

    const deleteAddress = useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/users/addresses/${id}`);
            return data.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['user'], (old: any) => ({
                ...old,
                addresses: data,
            }));
        },
    });

    return {
        addAddress,
        updateAddress,
        deleteAddress,
    };
};
