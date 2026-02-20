
'use client';

import ProductCard from './ProductCard';
import type { Product } from '@/types/product';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-[400px] bg-zinc-200 animate-pulse rounded-lg"
                    />
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-zinc-500">No products found</p>
                <p className="text-sm text-zinc-400 mt-2">
                    Try adjusting your filters or search terms
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}
