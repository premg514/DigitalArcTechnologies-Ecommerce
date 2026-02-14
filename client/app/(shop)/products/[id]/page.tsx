'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct, useProducts, useCreateReview } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils';
import { ShoppingCart, Star, Minus, Plus, Truck, Shield, MessageSquare, Send } from 'lucide-react';
import ProductGrid from '@/components/shop/ProductGrid';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const { data: product, isLoading } = useProduct(productId);
    const { addItem } = useCart();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Review state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [visibleReviews, setVisibleReviews] = useState(5);
    const createReviewMutation = useCreateReview(productId);

    // Related products
    const { data: relatedProductsData, isLoading: isRelatedLoading } = useProducts({
        category: product?.category,
        limit: 5,
    });

    const relatedProducts = relatedProductsData?.products?.filter(
        (p: any) => p._id !== productId
    ).slice(0, 4) || [];

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="aspect-square bg-zinc-200 rounded-lg" />
                        <div className="space-y-4">
                            <div className="h-8 bg-zinc-200 rounded w-3/4" />
                            <div className="h-4 bg-zinc-200 rounded w-1/2" />
                            <div className="h-12 bg-zinc-200 rounded w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold">Product not found</h1>
            </div>
        );
    }

    const discount = product.compareAtPrice
        ? calculateDiscount(product.compareAtPrice, product.price)
        : 0;

    const handleAddToCart = () => {
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0]?.url || '/placeholder.png',
            stock: product.stock,
        });
    };

    const handleQuantityDecrease = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    const handleQuantityIncrease = () => {
        setQuantity((prev) => Math.min(product.stock, prev + 1));
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to leave a review');
            return;
        }

        try {
            await createReviewMutation.mutateAsync({ rating, comment });
            toast.success('Review submitted successfully!');
            setComment('');
            setRating(5);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 pb-32 md:pb-12">
            <div className="grid md:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                        <Image
                            src={getImageUrl(product.images[selectedImage]?.url || '/placeholder.png')}
                            alt={product.images[selectedImage]?.alt || product.name}
                            fill
                            unoptimized
                            className="object-cover"
                            priority
                        />
                        {discount > 0 && (
                            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md font-semibold">
                                {discount}% OFF
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative aspect-square overflow-hidden rounded-md border-2 ${selectedImage === index
                                        ? 'border-blue-600'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <Image
                                        src={getImageUrl(image.url)}
                                        alt={image.alt}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    {/* Category */}
                    <p className="text-sm text-zinc-500 uppercase tracking-wide">
                        {product.category}
                    </p>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{product.ratings.toFixed(1)}</span>
                        </div>
                        <span className="text-zinc-500">
                            ({product.numReviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold">
                            {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                            <span className="text-xl text-zinc-500 line-through">
                                {formatPrice(product.compareAtPrice)}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Stock Status */}
                    <div>
                        {product.stock > 0 ? (
                            <p className="text-green-600 font-medium">
                                In Stock ({product.stock} available)
                            </p>
                        ) : (
                            <p className="text-red-600 font-medium">Out of Stock</p>
                        )}
                    </div>

                    {/* Quantity Selector - Desktop Only */}
                    <div className="space-y-2 hidden md:block">
                        <label className="text-sm font-medium">Quantity</label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleQuantityDecrease}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-16 text-center font-semibold text-lg">
                                {quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleQuantityIncrease}
                                disabled={quantity >= product.stock}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Add to Cart Button - Desktop Only */}
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        size="lg"
                        className="w-full hidden md:flex"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                        <div className="flex items-center gap-3">
                            <Truck className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="font-medium text-sm">Free Shipping</p>
                                <p className="text-xs text-zinc-500">On orders over ₹500</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="font-medium text-sm">Secure Payment</p>
                                <p className="text-xs text-zinc-500">100% protected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 grid lg:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                        Customer Reviews
                        {product.reviews.length > 0 && (
                            <span className="text-sm font-normal text-zinc-500">
                                ({product.reviews.length})
                            </span>
                        )}
                    </h2>
                    {product.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {product.reviews.slice(0, visibleReviews).map((review) => (
                                <Card key={review._id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-zinc-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-semibold">{review.name}</span>
                                            </div>
                                            <span className="text-xs text-zinc-400">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}

                            {product.reviews.length > visibleReviews && (
                                <Button
                                    variant="outline"
                                    onClick={() => setVisibleReviews((prev) => prev + 5)}
                                    className="w-full py-6 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all font-medium"
                                >
                                    Show More Reviews ({product.reviews.length - visibleReviews} more)
                                    <Plus className="ml-2 h-4 w-4" />
                                </Button>
                            )}

                            {visibleReviews > 5 && product.reviews.length <= visibleReviews && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setVisibleReviews(5)}
                                    className="w-full text-zinc-500 hover:text-zinc-900"
                                >
                                    Show Less
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-zinc-500 bg-white p-8 rounded-lg text-center border-2 border-dashed border-zinc-100 italic">
                            No reviews yet. Be the first to review!
                        </p>
                    )}
                </div>

                {/* Review Form */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Write a Review</h2>
                    {user ? (
                        <Card>
                            <CardContent className="p-6">
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setRating(s)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${s <= rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-zinc-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Your Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full rounded-md border border-zinc-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Share your experience with this product..."
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={createReviewMutation.isPending}
                                        className="w-full"
                                    >
                                        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                        <Send className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-blue-50/30 p-6 rounded-lg border border-blue-100 text-center">
                            <p className="text-blue-800 mb-4 font-medium">Please log in to share your thoughts about this product.</p>
                            <Link href="/login">
                                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                    Login to Review
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Related Products</h2>
                    </div>
                    <ProductGrid products={relatedProducts} isLoading={isRelatedLoading} />
                </div>
            )}

            {/* Sticky Mobile Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t z-50 md:hidden animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center gap-4 max-w-md mx-auto">
                    {/* Quantity Selector Mini */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-zinc-200 rounded-lg bg-white"
                            onClick={handleQuantityDecrease}
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-lg shadow-sm">
                            <span className="font-bold text-lg text-zinc-900">
                                {quantity}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-zinc-200 rounded-lg bg-white"
                            onClick={handleQuantityIncrease}
                            disabled={quantity >= product.stock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex-1 h-11"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                </div>
                {/* Safe area inset for mobile browsers */}
                <div className="h-safe-bottom" />
            </div>
        </div>
    );
}
