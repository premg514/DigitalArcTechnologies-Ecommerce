'use client';

import { MessageCircle } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export default function StickyWhatsApp() {
    return (
        <a
            href={`https://wa.me/${CONTACT_CONFIG.WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-6 z-50 md:hidden flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-slow"
            aria-label="Contact on WhatsApp"
        >
            <MessageCircle className="h-7 w-7 fill-white" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
        </a>
    );
}
