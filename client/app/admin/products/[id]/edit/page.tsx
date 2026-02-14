'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
    const params = useParams();
    const id = params?.id as string;

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}`);
            return data.data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-red-600">Error loading product</h2>
                <p className="text-zinc-600 mt-2">The product could not be found or there was an error loading it.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Edit Product
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    Update product details, pricing, and inventory.
                </p>
            </div>

            <ProductForm initialData={product} isEditing />
        </div>
    );
}
