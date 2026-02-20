'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Heart, Minus, Plus } from 'lucide-react';
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types/product';
import { useState, useEffect } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && product.images.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
            }, 1200); // Cycle every 1.2s
        } else {
            setCurrentImageIndex(0);
        }
        return () => clearInterval(interval);
    }, [isHovered, product.images.length]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock > 0) {
            addItem({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images[0]?.url || '/placeholder.png',
                stock: product.stock,
            });
            // Reset quantity after adding
            setQuantity(1);
        }
    };

    const incrementQty = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQty = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const discount = product.compareAtPrice
        ? calculateDiscount(product.compareAtPrice, product.price)
        : 0;

    return (
        <Card
            className="group h-full overflow-hidden transition-all duration-300 organic-shadow-lg hover:organic-shadow-xl border-none bg-white flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden">
                {/* Product Image */}
                <Image
                    src={getImageUrl(product.images[currentImageIndex]?.url || '/placeholder.png')}
                    alt={product.images[currentImageIndex]?.alt || product.name}
                    fill
                    unoptimized
                    className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Image Indicators */}
                {product.images.length > 1 && isHovered && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10 px-2">
                        {product.images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-secondary' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Badge (Tagline / Discount) */}
                <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-2">
                    {discount > 0 ? (
                        <div className="bg-secondary-terracotta text-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-bl-lg shadow-sm">
                            {discount}% OFF
                        </div>
                    ) : product.tagline && (
                        <div className="bg-[#41888F] text-white px-3 py-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider rounded-bl-lg shadow-sm">
                            <span>{product.tagline}</span>
                            <Heart className="h-3 w-3 fill-white" />
                        </div>
                    )}
                </div>

                {/* Out of Stock Overlay */}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-primary-maroon/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white text-primary-maroon px-4 py-2 rounded-md font-semibold text-xs uppercase tracking-widest shadow-lg">
                            Sold Out
                        </span>
                    </div>
                )}
            </Link>

            <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <Link href={`/products/${product._id}`} className="min-w-0 flex-1">
                        <h3 className="font-heading font-bold text-sm sm:text-lg text-primary line-clamp-2 hover:text-secondary transition-colors leading-tight">
                            {product.name}
                        </h3>
                    </Link>
                    <span className="text-sm sm:text-lg font-bold text-primary whitespace-nowrap mt-0.5">
                        {formatPrice(product.price)}
                    </span>
                </div>

                {/* Tagline or Short Info */}
                <p className="text-[10px] sm:text-sm text-zinc-500 mb-3 sm:mb-4 line-clamp-1 italic font-medium">
                    {product.tagline || 'Pure & Natural'}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-between gap-1.5 mb-4 sm:mb-5">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${i < Math.floor(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`}
                            />
                        ))}
                        <span className="ml-1 text-[10px] sm:text-xs font-bold text-zinc-600">{product.ratings.toFixed(1)}</span>
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {product.numReviews} Reviews
                    </span>
                </div>

                {/* Quantity Selector */}
                <div className="mt-auto">
                    <div className="flex items-center justify-between border border-zinc-200 rounded-lg overflow-hidden bg-white h-9 sm:h-11">
                        <button
                            onClick={decrementQty}
                            disabled={quantity <= 1 || product.stock === 0}
                            className="flex-1 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer transition-colors disabled:opacity-30"
                        >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-primary px-2 min-w-[30px] text-center">
                            {quantity}
                        </span>
                        <button
                            onClick={incrementQty}
                            disabled={quantity >= product.stock || product.stock === 0}
                            className="flex-1 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer transition-colors disabled:opacity-30"
                        >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-3 sm:p-4 pt-0">
                <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest h-10 sm:h-12 rounded-lg transition-all active:scale-95 shadow-md"
                >
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
