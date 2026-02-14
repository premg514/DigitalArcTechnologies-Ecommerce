'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const announcements = [
    {
        text: '🎉 Big Savings Alert! Get 10% OFF on orders above ₹3000 | Use code - SAVE10',
        link: '/shop',
    },
    {
        text: '🚚 Enjoy Free Shipping on orders above ₹1499 | Shop Now',
        link: '/shop',
    },
    {
        text: '✨ New Arrivals! Check out our latest organic products',
        link: '/shop',
    },
];

export default function AnnouncementBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="relative bg-primary text-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-center h-10 relative">
                    <a
                        href={announcements[currentIndex].link}
                        className="text-sm font-medium hover:underline text-center px-8 transition-opacity duration-300"
                    >
                        {announcements[currentIndex].text}
                    </a>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute right-0 p-2 hover:bg-primary-dark rounded-full transition-colors"
                        aria-label="Close announcement"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>


        </div>
    );
}
