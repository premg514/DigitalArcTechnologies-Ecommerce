'use client';

import { useState } from 'react';
import HeroSection from '@/components/shop/HeroSection';
import ProductGrid from '@/components/shop/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SORT_OPTIONS } from '@/lib/constants';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function HomePage() {
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        sort: 'newest' as const,
        page: 1,
    });

    const { data: productsData, isLoading } = useProducts(filters);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleSortChange = (value: string) => {
        setFilters((prev) => ({ ...prev, sort: value as any }));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <HeroSection />

            {/* All Products */}
            {/* All Products */}
            <section id="product" className="bg-cream py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-sage-soft mb-3">
                            Our Products
                        </h2>
                        <p className="text-sage-muted max-w-2xl mx-auto italic">
                            Discover our complete collection of natural products
                        </p>
                    </div>

                    {/* Search and Sort */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-sage-muted" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={handleSearchChange}
                                className="pl-10 h-12 text-base border-[var(--border-medium)] focus:border-secondary focus:ring-secondary"
                            />
                        </div>
                        <Select value={filters.sort} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white border-[var(--border-medium)]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Products Grid */}
                    <ProductGrid
                        products={productsData?.products || []}
                        isLoading={isLoading}
                    />

                    {/* Pagination Info */}
                    {productsData && productsData.total > 0 && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                            <div className="text-sm text-sage-muted">
                                Showing {productsData.products.length} of {productsData.total} products
                            </div>

                            {productsData.pages > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                                        disabled={(productsData.page || 1) === 1 || isLoading}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm font-medium">
                                        Page {productsData.page} of {productsData.pages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                        disabled={(productsData.page || 1) === productsData.pages || isLoading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
