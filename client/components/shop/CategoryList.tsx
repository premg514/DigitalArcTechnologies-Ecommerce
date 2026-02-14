'use client';

import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

interface CategoryListProps {
    selectedCategory?: string;
    onCategoryChange: (category: string) => void;
}

export default function CategoryList({
    selectedCategory,
    onCategoryChange,
}: CategoryListProps) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categories</h3>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!selectedCategory ? 'default' : 'outline'}
                    onClick={() => onCategoryChange('')}
                    size="sm"
                >
                    All
                </Button>
                {PRODUCT_CATEGORIES.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        onClick={() => onCategoryChange(category)}
                        size="sm"
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
    );
}
