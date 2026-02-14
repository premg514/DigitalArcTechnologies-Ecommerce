'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Create Product
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    Add a new product to your store catalog.
                </p>
            </div>

            <ProductForm />
        </div>
    );
}
