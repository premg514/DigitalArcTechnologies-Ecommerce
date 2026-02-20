'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from '@/components/shop/HeroSection';
import ProductGrid from '@/components/shop/ProductGrid';
import CategorySection from '@/components/shop/CategorySection';
import RecipeSection from '@/components/shop/RecipeSection';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SORT_OPTIONS } from '@/lib/constants';
import { Search, X, Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function HomeContent() {
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState('');

    const [filters, setFilters] = useState({
        category: '',
        priorityCategory: searchParams.get('category') || '',
        search: '',
        sort: 'newest' as const,
        page: 1,
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // Update priority category when searchParams change (from Hero banners)
    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setFilters(prev => ({ ...prev, priorityCategory: category, category: '', page: 1 }));

            // Scroll to product section if a category is selected
            const productSection = document.getElementById('product');
            if (productSection) {
                const navHeight = 120; // approximate height of header
                const top = productSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    }, [searchParams]);

    const { data: productsData, isLoading } = useProducts(filters);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSortChange = (value: string) => {
        setFilters((prev) => ({ ...prev, sort: value as any }));
    };

    const clearPriority = () => {
        setFilters(prev => ({ ...prev, priorityCategory: '' }));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <HeroSection />

            {/* All Products Section */}
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

                    {/* Priority Category Indicator */}
                    {filters.priorityCategory && (
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full animate-fadeIn">
                                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                                    Prioritizing: {filters.priorityCategory}
                                </span>
                                <button
                                    onClick={clearPriority}
                                    className="text-secondary hover:text-secondary-dark transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Search and Sort */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={handleSearchChange}
                                className="pl-10 h-14 text-base border-zinc-200 focus:border-secondary focus:ring-secondary rounded-xl shadow-sm"
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

            {/* Shop by Category Section */}
            <CategorySection />

            {/* Recipes Section */}
            <RecipeSection />
        </div>
    );
}

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-12 w-12 animate-spin text-secondary" />
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
