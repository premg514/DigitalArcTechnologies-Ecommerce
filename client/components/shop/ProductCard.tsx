'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock > 0) {
            addItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.images[0]?.url || '/placeholder.png',
                stock: product.stock,
            });
        }
    };

    const discount = product.compareAtPrice
        ? calculateDiscount(product.compareAtPrice, product.price)
        : 0;

    return (
        <Link href={`/products/${product._id}`}>
            <Card className="group h-full overflow-hidden transition-all hover:shadow-organic-lg border-[var(--border-light)] bg-white">
                <div className="relative aspect-square overflow-hidden bg-cream">
                    {/* Product Image */}
                    <Image
                        src={getImageUrl(product.images[0]?.url || '/placeholder.png')}
                        alt={product.images[0]?.alt || product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-accent text-brown-dark px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                            {discount}% OFF
                        </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-brown-dark/60 flex items-center justify-center backdrop-blur-sm">
                            <span className="bg-white text-brown-dark px-5 py-2.5 rounded-lg font-semibold text-sm shadow-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <Heart className="h-4 w-4 text-brown-dark hover:text-accent transition-colors" />
                    </button>
                </div>

                <CardContent className="p-4">
                    {/* Category */}
                    <p className="text-xs text-sage-muted uppercase tracking-wider mb-2 font-medium">
                        {product.category}
                    </p>

                    {/* Product Name */}
                    <h3 className="font-heading font-semibold text-base text-sage-soft line-clamp-2 mb-2 group-hover:text-secondary transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-0.5">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm font-medium text-sage-soft">{product.ratings.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-brown-light">
                            ({product.numReviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-secondary font-heading">
                            {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                            <span className="text-sm text-brown-light line-through">
                                {formatPrice(product.compareAtPrice)}
                            </span>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-2.5 rounded-lg transition-all hover:shadow-md disabled:bg-brown-light disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
