'use client';

import Link from 'next/link';
import { ArrowRight, Wheat, Sprout, Nut } from 'lucide-react';

const categories = [
    {
        name: 'Rice',
        tagline: 'Pure, Mill-Fresh Grains',
        icon: Wheat,
        color: 'bg-[#F4F1EA]',
        iconColor: 'text-[#8B7355]',
        href: '/?category=Rice'
    },
    {
        name: 'Jaggery',
        tagline: 'Traditional Chemical-Free Sweetness',
        icon: Sprout,
        color: 'bg-[#F9F5F0]',
        iconColor: 'text-[#A67B5B]',
        href: '/?category=Jaggery'
    },
    {
        name: 'Nuts',
        tagline: 'Premium Handpicked Selection',
        icon: Nut,
        color: 'bg-[#F0F2F1]',
        iconColor: 'text-[#5F7A61]',
        href: '/?category=Nuts'
    }
];

export default function CategorySection() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-4 block">
                        Browse our collection
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary mb-4">
                        Shop by Category
                    </h2>
                    <div className="w-20 h-1 bg-secondary/20 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={category.href}
                            className="group relative block"
                        >
                            <div className={`relative h-[160px] md:h-[320px] overflow-hidden rounded-2xl md:rounded-[2.5rem] transition-all duration-700 group-hover:rounded-[1.5rem] flex flex-col items-center justify-center p-4 md:p-12 text-center group-hover:shadow-lg group-hover:shadow-zinc-100 ${category.color}`}>
                                {/* Icon Container */}
                                <div className={`mb-3 md:mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1`}>
                                    <category.icon className={`w-10 h-10 md:w-24 h-24 ${category.iconColor} stroke-[1.5px]`} />
                                </div>

                                <div className="space-y-1 md:space-y-3">
                                    <h3 className="text-sm md:text-3xl font-heading font-bold text-primary">
                                        {category.name}
                                    </h3>
                                    <p className="hidden md:block text-xs text-secondary font-bold uppercase tracking-widest max-w-[200px] mx-auto opacity-70">
                                        {category.tagline}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
