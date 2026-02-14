'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: 'Premium Single Polished Rice',
        subtitle: 'Farm Fresh',
        description: 'Experience the authentic taste of traditionally polished rice. Perfectly aged and naturally aromatic.',
        cta: 'Shop Rice',
        ctaLink: '/',
        bgGradient: 'from-orange-100 via-red-50 to-amber-50',
        emoji: '🍚',
    },
    {
        id: 2,
        title: 'Pure Organic Jaggery',
        subtitle: 'Natural Sweetness',
        description: 'Golden, mineral-rich jaggery made without chemicals. The perfect healthy alternative to sugar.',
        cta: 'Shop Jaggery',
        ctaLink: '/',
        bgGradient: 'from-amber-100 via-orange-50 to-yellow-50',
        emoji: '🧇',
    },
    {
        id: 3,
        title: 'Premium Dry Fruits',
        subtitle: 'Healthy Snacking',
        description: 'Finest quality almonds, cashews, and raisins packed with nutrition and natural goodness.',
        cta: 'Shop Dry Fruits',
        ctaLink: '/',
        bgGradient: 'from-orange-50 via-amber-50 to-red-50',
        emoji: '🌰',
    },
];

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    // Touch event handlers for swipe
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    };

    return (
        <section className="relative overflow-hidden">
            {/* Carousel Container */}
            <div
                className="relative h-[500px] md:h-[600px]"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                            ? 'opacity-100 translate-x-0'
                            : index < currentSlide
                                ? 'opacity-0 -translate-x-full'
                                : 'opacity-0 translate-x-full'
                            }`}
                    >
                        <div className={`h-full bg-gradient-to-br ${slide.bgGradient}`}>
                            <div className="container mx-auto px-4 h-full">
                                <div className="grid lg:grid-cols-2 gap-8 items-center h-full py-12">
                                    {/* Text Content */}
                                    <div className="space-y-4 md:space-y-6 animate-fadeIn relative z-10">
                                        <div className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-white/60 backdrop-blur-sm rounded-full">
                                            <span className="text-xs md:text-sm font-medium text-sage-soft">
                                                {slide.subtitle}
                                            </span>
                                        </div>

                                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-sage-soft leading-tight">
                                            {slide.title}
                                        </h1>

                                        <p className="text-base sm:text-lg md:text-xl text-sage-muted max-w-xl">
                                            {slide.description}
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                                            <Link href={slide.ctaLink} className="w-full sm:w-auto">
                                                <Button
                                                    size="lg"
                                                    className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    {slide.cta}
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </Link>
                                            <Link href="/#product" className="w-full sm:w-auto">
                                                <Button
                                                    size="lg"
                                                    variant="outline"
                                                    className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white font-medium transition-all"
                                                >
                                                    Browse All
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Visual Element - Hidden on mobile, visible on lg screens */}
                                    <div className="relative hidden lg:flex items-center justify-center">

                                        <div className="relative">
                                            {/* Main Circle */}
                                            <div className="w-80 h-80 rounded-full bg-white/40 backdrop-blur-md border-2 border-white/60 shadow-2xl flex items-center justify-center">
                                                <div className="text-center space-y-4">
                                                    <div className="text-9xl animate-pulse">
                                                        {slide.emoji}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Decorative Circles */}
                                            <div className="absolute -top-8 -right-8 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
                                            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                                            <div className="absolute top-1/2 -right-12 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows - Hidden on mobile, visible on md and up */}
            <button
                onClick={prevSlide}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110 z-10"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6 text-sage-soft" />
            </button>
            <button
                onClick={nextSlide}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110 z-10"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6 text-sage-soft" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all ${index === currentSlide
                            ? 'w-12 h-3 bg-secondary'
                            : 'w-3 h-3 bg-white/60 hover:bg-white/80'
                            } rounded-full`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Wave Separator */}
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path
                        d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        fill="white"
                    />
                </svg>
            </div>
        </section>
    );
}
