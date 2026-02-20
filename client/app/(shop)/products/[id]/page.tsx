'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct, useProducts, useCreateReview } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, calculateDiscount, getImageUrl } from '@/lib/utils';
import { ShoppingCart, Star, Minus, Plus, Truck, Shield, MessageSquare, Send, ChevronLeft, ChevronRight, CheckCircle2, MapPin, Home, Info, Loader2 } from 'lucide-react';
import ProductGrid from '@/components/shop/ProductGrid';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
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

    // Pincode check state
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'allowed' | 'not-allowed'>('idle');
    const [pincodeMessage, setPincodeMessage] = useState('');

    const handlePincodeCheck = async () => {
        if (pincode.length !== 6) {
            toast.error('Please enter a valid 6-digit pincode');
            return;
        }

        try {
            setPincodeStatus('checking');
            const { data: check } = await api.get(`/pincodes/check/${pincode}`);
            if (check.isAllowed) {
                setPincodeStatus('allowed');
                setPincodeMessage('Delivery available at this location');
            } else {
                setPincodeStatus('not-allowed');
                setPincodeMessage(check.message || 'Shipping not available for this pincode');
            }
        } catch (error) {
            setPincodeStatus('not-allowed');
            setPincodeMessage('Error checking delivery status');
        }
    };

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
            <div className="container mx-auto px-4 py-12 min-h-screen">
                <div className="animate-pulse space-y-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="aspect-square bg-zinc-200/50 rounded-2xl" />
                        <div className="space-y-6">
                            <div className="h-4 bg-zinc-200/50 rounded w-1/4" />
                            <div className="h-10 bg-zinc-200/50 rounded w-3/4" />
                            <div className="h-6 bg-zinc-200/50 rounded w-1/2" />
                            <div className="h-12 bg-zinc-200/50 rounded w-1/3" />
                            <div className="space-y-2 pt-8">
                                <div className="h-4 bg-zinc-200/50 rounded" />
                                <div className="h-4 bg-zinc-200/50 rounded" />
                                <div className="h-4 bg-zinc-200/50 rounded w-5/6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-3xl font-heading font-bold text-primary mb-4">Product Not Found</h1>
                <p className="text-zinc-500 mb-8">We couldn't find the product you're looking for.</p>
                <Link href="/">
                    <Button variant="outline" className="rounded-full px-8">Back to Shop</Button>
                </Link>
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

    const handleBuyNow = () => {
        addItem({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.images[0]?.url || '/placeholder.png',
            stock: product.stock,
        });
        router.push('/checkout');
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
        <div className="bg-cream/20 min-h-screen">
            <div className="container mx-auto px-4 py-6 md:py-10 pb-32 md:pb-16">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Link href="/" className="hover:text-secondary flex items-center gap-1.5 transition-colors">
                        <Home className="h-3.5 w-3.5" />
                        Home
                    </Link>
                    <ChevronRight className="h-3 w-3 text-zinc-300" />
                    <Link href="/" className="hover:text-secondary transition-colors">
                        Shop
                    </Link>
                    <ChevronRight className="h-3 w-3 text-zinc-300" />
                    <span className="text-zinc-400">{product.category}</span>
                    <ChevronRight className="h-3 w-3 text-zinc-300" />
                    <span className="text-primary truncate max-w-[200px]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
                    {/* Left: Product Images (5/12) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Main Image Container */}
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-white organic-shadow-lg group">
                            <Image
                                src={getImageUrl(product.images[selectedImage]?.url || '/placeholder.png')}
                                alt={product.images[selectedImage]?.alt || product.name}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />

                            {/* Badges */}
                            <div className="absolute top-6 left-6 flex flex-col gap-2">
                                {discount > 0 && (
                                    <div className="bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-full organic-shadow">
                                        {discount}% OFF
                                    </div>
                                )}
                            </div>

                            {/* Nav Buttons */}
                            {product.images.length > 1 && (
                                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1) }}
                                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm organic-shadow hover:bg-white transition-all"
                                    >
                                        <ChevronLeft className="h-6 w-6 text-primary" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1) }}
                                        className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm organic-shadow hover:bg-white transition-all"
                                    >
                                        <ChevronRight className="h-6 w-6 text-primary" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Grid */}
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={cn(
                                            "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 organic-shadow-sm",
                                            selectedImage === index
                                                ? 'border-secondary scale-95 ring-2 ring-secondary/20'
                                                : 'border-white hover:border-secondary/40'
                                        )}
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

                    {/* Right: Product Info (7/12) */}
                    <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-24">
                        <div className="space-y-4">
                            {/* Category & Rating (Tagline below title) */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium uppercase tracking-widest text-secondary invisible">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-zinc-100">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-base font-medium text-primary">{product.ratings.toFixed(1)}</span>
                                    <span className="text-sm text-zinc-400 font-medium ml-1">
                                        ({product.numReviews} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Title & Tagline */}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-heading font-semibold text-primary leading-tight">
                                    {product.name}
                                </h1>
                                {product.tagline && (
                                    <p className="text-lg md:text-xl font-medium text-secondary italic">
                                        {product.tagline}
                                    </p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-4 py-3">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-semibold text-primary tracking-tight">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.compareAtPrice && (
                                        <span className="text-xl text-zinc-400 line-through font-medium">
                                            {formatPrice(product.compareAtPrice)}
                                        </span>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <span className="text-emerald-600 font-medium text-sm">
                                        {discount}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <p className="text-zinc-500 leading-relaxed text-base font-normal">
                                {product.description}
                            </p>
                        </div>

                        {/* Delivery Check Section */}
                        <div className="space-y-4 p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                            <div className="flex items-center gap-2 text-primary">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm font-semibold uppercase tracking-wider">Check Delivery</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="Enter 6-digit Pincode"
                                    className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 text-sm focus:border-secondary transition-all outline-none"
                                />
                                <Button
                                    onClick={handlePincodeCheck}
                                    variant="outline"
                                    disabled={pincodeStatus === 'checking'}
                                    className="rounded-xl px-6 border-secondary text-secondary hover:bg-secondary hover:text-white"
                                >
                                    {pincodeStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                                </Button>
                            </div>
                            {pincodeStatus !== 'idle' && (
                                <p className={cn(
                                    "text-xs font-medium",
                                    pincodeStatus === 'allowed' ? 'text-emerald-600' : 'text-red-600'
                                )}>
                                    {pincodeMessage}
                                </p>
                            )}
                        </div>

                        {/* Actions Container */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center bg-white border border-zinc-200 rounded-xl px-2 h-14">
                                    <button
                                        className="h-10 w-10 flex items-center justify-center text-primary hover:bg-zinc-50 rounded-lg transition-colors"
                                        onClick={handleQuantityDecrease}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-primary">{quantity}</span>
                                    <button
                                        className="h-10 w-10 flex items-center justify-center text-primary hover:bg-zinc-50 rounded-lg transition-colors"
                                        onClick={handleQuantityIncrease}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 h-14 bg-secondary hover:bg-secondary-dark text-white rounded-xl organic-shadow font-bold text-base"
                                >
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <Button
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1 h-14 bg-primary hover:bg-primary-dark text-white rounded-xl organic-shadow font-bold text-base"
                                >
                                    Buy Now
                                </Button>
                            </div>
                        </div>

                        {/* Trust Section */}
                        <div className="p-8 rounded-lg bg-white border border-cream organic-shadow-lg space-y-8">
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 py-8 border-t border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <Truck className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Free Delivery</p>
                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">On All Orders</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Secure Payments</p>
                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">100% Encrypted</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Direct From Source</p>
                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">No Middlemen</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <Info className="h-5 w-5 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">Small Batches</p>
                                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Freshly Packaged</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-24 space-y-16">
                    <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Community Feedback</span>
                                <h2 className="text-3xl font-heading font-semibold text-primary">Customer Reviews</h2>
                            </div>

                            {product.reviews.length > 0 ? (
                                <div className="space-y-10">
                                    {/* Rating Summary */}
                                    <div className="flex flex-col sm:flex-row items-center gap-10 p-8 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                                        <div className="text-center sm:text-left space-y-2">
                                            <div className="text-5xl font-semibold text-primary tracking-tighter">
                                                {product.ratings.toFixed(1)}
                                            </div>
                                            <div className="flex gap-1 justify-center sm:justify-start">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "h-4 w-4",
                                                            i < Math.floor(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest pt-1">
                                                Based on {product.reviews.length} reviews
                                            </p>
                                        </div>

                                        <div className="flex-1 w-full space-y-3">
                                            {[5, 4, 3, 2, 1].map((rating) => {
                                                const count = product.reviews.filter(r => r.rating === rating).length;
                                                const percentage = (count / product.reviews.length) * 100;
                                                return (
                                                    <div key={rating} className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-zinc-500 w-4">{rating}</span>
                                                        <div className="flex-1 h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                                            <div
                                                                className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-normal text-zinc-400 w-8 text-right">
                                                            {Math.round(percentage)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {product.reviews.slice(0, visibleReviews).map((review) => {
                                            const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                            return (
                                                <div key={review._id} className="p-8 rounded-2xl bg-white border border-zinc-50 shadow-sm transition-all hover:shadow-md group">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-full bg-secondary/5 border border-secondary/10 flex items-center justify-center text-secondary font-semibold text-sm">
                                                                {initials}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-primary">{review.name}</h4>
                                                                <div className="flex gap-0.5 mt-0.5">
                                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            className={cn(
                                                                                "h-3 w-3",
                                                                                i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'
                                                                            )}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[9px] font-semibold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Verified Purchase
                                                        </div>
                                                    </div>
                                                    <p className="text-zinc-600 leading-relaxed text-sm md:text-base font-normal">
                                                        {review.comment}
                                                    </p>
                                                    <div className="mt-6 pt-6 border-t border-zinc-50 flex justify-between items-center">
                                                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                                                            Experience shared • {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {product.reviews.length > visibleReviews && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setVisibleReviews((prev) => prev + 5)}
                                                className="w-full h-14 rounded-xl border-zinc-200 text-zinc-500 font-semibold hover:bg-zinc-50 transition-all"
                                            >
                                                Load More Reviews
                                                <Plus className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-16 rounded-3xl bg-white border border-dashed border-zinc-200 flex flex-col items-center text-center space-y-6">
                                    <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center">
                                        <MessageSquare className="h-10 w-10 text-zinc-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-semibold text-primary">No feedback yet</p>
                                        <p className="text-zinc-400 text-sm max-w-[260px]">Be the very first to share your experience with this premium product.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="space-y-8 lg:sticky lg:top-32 h-fit">
                            <div className="p-10 rounded-3xl bg-cream/10 border border-zinc-100 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-heading font-semibold text-primary">Share Your Story</h3>
                                        <p className="text-sm text-zinc-500 font-normal">Your feedback helps the community grow healthier together.</p>
                                    </div>

                                    {user ? (
                                        <form onSubmit={handleReviewSubmit} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Your Rating</label>
                                                <div className="flex gap-4 p-4 bg-white rounded-2xl border border-zinc-50 shadow-sm w-fit">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setRating(s)}
                                                            className="focus:outline-none transition-all hover:scale-125 active:scale-90"
                                                        >
                                                            <Star
                                                                className={cn(
                                                                    "h-8 w-8 transition-colors",
                                                                    s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-100'
                                                                )}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Detailed Feedback</label>
                                                <textarea
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                    required
                                                    rows={6}
                                                    className="w-full rounded-2xl border border-zinc-100 bg-white p-6 text-primary placeholder:text-zinc-300 focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all outline-none resize-none font-medium shadow-sm"
                                                    placeholder="Tell us about the quality, taste, or your overall experience..."
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={createReviewMutation.isPending}
                                                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-lg shadow-lg group transition-all"
                                            >
                                                {createReviewMutation.isPending ? (
                                                    <Loader2 className="h-6 w-6 animate-spin" />
                                                ) : (
                                                    <>
                                                        Publish Review
                                                        <Send className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="text-center p-8 space-y-6">
                                            <div className="h-16 w-16 rounded-full bg-secondary/5 flex items-center justify-center mx-auto">
                                                <Info className="h-8 w-8 text-secondary" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-semibold text-primary">Member Verification Required</p>
                                                <p className="text-sm text-zinc-400 font-normal">Please sign in to your account to post your review and earn loyalty points.</p>
                                            </div>
                                            <Link href="/login" className="block">
                                                <Button className="w-full h-14 rounded-xl bg-primary text-white font-bold">
                                                    Sign In to Continue
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32">
                        <div className="flex flex-col items-center text-center space-y-6 mb-16">
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary/60">Curated Collection</span>
                                <h2 className="text-2xl md:text-3xl font-heading font-bold text-primary tracking-tight">Pairs Well With This</h2>
                            </div>
                            <div className="flex items-center gap-4 w-full max-w-xs mx-auto">
                                <div className="h-px flex-1 bg-zinc-100" />
                                <div className="h-1.5 w-1.5 rounded-full bg-secondary/30" />
                                <div className="h-px flex-1 bg-zinc-100" />
                            </div>
                        </div>
                        <ProductGrid products={relatedProducts} isLoading={isRelatedLoading} />
                    </div>
                )}

                {/* Premium Mobile Sticky Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-primary/95 backdrop-blur-xl border-t border-white/20 z-50 md:hidden organic-shadow-lg animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Total Price</span>
                            <span className="text-lg font-semibold text-white tracking-tight">{formatPrice(product.price * quantity)}</span>
                        </div>

                        {/* Quantity Mini - Aesthetic pills */}
                        <div className="flex items-center bg-white/10 rounded-lg border border-white/10 p-0.5">
                            <button
                                className="h-8 w-8 flex items-center justify-center text-white/80 active:scale-75 transition-transform"
                                onClick={handleQuantityDecrease}
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-bold text-white text-sm">{quantity}</span>
                            <button
                                className="h-8 w-8 flex items-center justify-center text-white/80 active:scale-75 transition-transform"
                                onClick={handleQuantityIncrease}
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Add to Cart & Buy Now */}
                        <div className="flex-1 flex gap-2">
                            <Button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 h-11 sm:h-12 bg-secondary hover:bg-secondary-dark text-white rounded-lg organic-shadow font-bold text-[10px] sm:text-xs px-1"
                            >
                                <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                                Cart
                            </Button>
                            <Button
                                onClick={handleBuyNow}
                                disabled={product.stock === 0}
                                className="flex-1 h-11 sm:h-12 bg-white text-primary hover:bg-zinc-50 rounded-lg organic-shadow font-bold text-[10px] sm:text-xs px-1"
                            >
                                Buy Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
