'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const slides = [
    {
        id: 1,
        title: 'Single Polished Rice, Done Right.',
        subtitle: 'Pure & Natural',
        description: 'Sourced from trusted farmers, processed in our own mill, and delivered directly to you — no middlemen, no compromises.',
        cta: 'Shop Rice',
        ctaLink: '/?category=Rice',
        backgroundImage: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771585915/indian_rice_village_hero_1771585454404_ufscxg.jpg',
        emoji: '🍚',
    },
    {
        id: 2,
        title: 'Natural Jaggery, Rooted in Tradition.',
        subtitle: 'Chemical Free',
        description: 'Crafted from fresh cane juice, slow boiled in small batches, and delivered pure — no chemicals, no shortcuts.',
        cta: 'Shop Jaggery',
        ctaLink: '/?category=Jaggery',
        backgroundImage: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771586111/Gemini_Generated_Image_4t667o4t667o4t66_ylenr8.png',
        emoji: '🧇',
    },
    {
        id: 3,
        title: 'Jumbo Cashews, Curated for Quality.',
        subtitle: 'Premium Selection',
        description: 'Sourced from select growers, processed with care, and brought to you at their best — honoring the cashew’s true taste.',
        cta: 'Shop Nuts & Seeds',
        ctaLink: '/?category=Nuts',
        backgroundImage: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771585915/hero_cashew_orchard_premium_1771585639697_bhaxua.jpg',
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
        }, 6000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    return (
        <section className="relative overflow-hidden bg-[#FAF9F6]">
            {/* Carousel Container */}
            <div className="relative h-auto min-h-[600px] md:h-[650px] lg:h-[700px]">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <div className="container mx-auto px-4 h-full">
                            <div className="flex flex-col md:flex-row h-full items-center gap-8 lg:gap-16 py-12 md:py-0">
                                {/* Left Side: Content */}
                                <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1 pb-16 md:pb-0">
                                    <div className="max-w-xl mx-auto md:mx-0">
                                        <span className="inline-block text-[10px] md:text-xs font-bold text-secondary mb-3 md:mb-5 uppercase tracking-[0.3em] animate-fadeIn">
                                            {slide.subtitle}
                                        </span>
                                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-primary leading-[1.1] mb-4 md:mb-8 animate-slideUp">
                                            {slide.title}
                                        </h1>
                                        <p className="text-sm md:text-lg text-zinc-500 mb-8 md:mb-10 leading-relaxed animate-fadeIn delay-300">
                                            {slide.description}
                                        </p>
                                        <div className="flex justify-center md:justify-start animate-slideUp delay-500">
                                            <Link href={slide.ctaLink}>
                                                <Button
                                                    size="lg"
                                                    className="bg-secondary hover:bg-secondary-dark text-white font-bold px-10 md:px-14 h-12 md:h-16 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-secondary/20"
                                                >
                                                    {slide.cta}
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Image - Organic Shape */}
                                <div className="w-full md:w-1/2 relative aspect-video md:aspect-auto h-auto md:h-[500px] lg:h-[550px] order-1 md:order-2 animate-fadeInRight">
                                    <div className="absolute inset-0 bg-secondary/5 rounded-[3rem] rotate-2 -z-10" />
                                    <div className="absolute inset-0 overflow-hidden rounded-[3rem] shadow-2xl border-2 border-white">
                                        <Image
                                            src={slide.backgroundImage}
                                            alt={slide.title}
                                            fill
                                            priority={index === 0}
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>

                                    {/* Single Glassy Capsule Tag - Top Left */}
                                    <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-white/40 backdrop-blur-xl pl-2 pr-6 py-2 rounded-full shadow-2xl border border-white/40 animate-fadeIn z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/60 flex items-center justify-center text-xl md:text-2xl shadow-sm transition-transform hover:scale-110">
                                                {slide.emoji}
                                            </div>
                                            <div>
                                                <p className="text-[8px] md:text-[9px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-0.5 leading-none">Premium</p>
                                                <p className="text-[10px] md:text-xs font-black text-primary whitespace-nowrap leading-none">
                                                    {index === 0 ? 'Direct from Mill' : index === 1 ? 'Handcrafted' : 'Grade A Quality'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Minimalist Navigation Dots */}
                <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => { setCurrentSlide(index); setIsAutoPlaying(false); }}
                            className={`group relative py-4 focus:outline-none`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            <span className={`block h-[2px] transition-all duration-500 rounded-full ${index === currentSlide ? 'w-12 bg-secondary' : 'w-4 bg-zinc-200 group-hover:bg-zinc-300'
                                }`} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
