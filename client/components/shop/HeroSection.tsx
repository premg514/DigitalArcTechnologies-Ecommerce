'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        title: 'Single Polished Rice, Done Right.',
        subtitle: 'From Our Mill To You',
        description: 'Sourced from trusted farmers, processed in our own mill, and delivered directly to you — no middlemen, no compromises.',
        cta: 'Shop Rice',
        ctaLink: '/products?category=Rice',
        backgroundImage: '/images/Hero_Slide_1.jpg',
        emoji: '🍚',
    },
    {
        id: 2,
        title: 'Natural Jaggery, Rooted in Tradition.',
        subtitle: 'Chemical Free',
        description: 'Crafted from fresh cane juice, slow boiled in small batches, and delivered pure — no chemicals, no shortcuts.',
        cta: 'Shop Jaggery',
        ctaLink: '/products?category=Jaggery',
        backgroundImage: '/images/Hero_Slide_2.jpg',
        emoji: '🧇',
    },
    {
        id: 3,
        title: 'Jumbo Cashews, Curated for Quality.',
        subtitle: 'Premium Selection',
        description: 'Sourced from select growers, processed with care, and brought to you at their best — honoring the cashew’s true taste.',
        cta: 'Shop Nuts & Seeds',
        ctaLink: '/products?category=Dry Fruits',
        backgroundImage: '/images/Hero_Slide_3.jpg',
        emoji: '🌰',
    },
];

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-advance slides
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000); // Change slide every 6 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    return (
        <section className="relative overflow-hidden bg-white">
            {/* Carousel Container */}
            <div className="relative h-[40vh] md:h-[600px] min-h-[350px]">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {/* Background Image with Overlay */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear group-hover:scale-110"
                            style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                        >
                            <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
                        </div>

                        <div className="container mx-auto px-4 h-full relative z-20">
                            <div className="flex flex-col justify-center h-full max-w-2xl">
                                <span className="inline-block text-xs md:text-sm font-bold text-white mb-2 md:mb-4 uppercase tracking-[0.3em] animate-fadeIn">
                                    {slide.subtitle}
                                </span>
                                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-[1.1] mb-3 md:mb-6 animate-slideUp">
                                    {slide.title}
                                </h1>
                                <p className="text-sm md:text-lg text-white/90 mb-6 md:mb-8 line-clamp-3 md:line-clamp-none animate-fadeIn delay-300">
                                    {slide.description}
                                </p>
                                <div className="flex gap-4 animate-slideUp delay-500">
                                    <Link href={slide.ctaLink}>
                                        <Button
                                            size="lg"
                                            className="bg-secondary hover:bg-secondary-dark text-white font-bold px-6 md:px-10 h-12 md:h-14 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
                                        >
                                            {slide.cta}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => { setCurrentSlide(index); setIsAutoPlaying(false); }}
                            className={`h-1.5 transition-all rounded-full ${index === currentSlide ? 'w-8 bg-secondary' : 'w-2 bg-white/50 hover:bg-white'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
