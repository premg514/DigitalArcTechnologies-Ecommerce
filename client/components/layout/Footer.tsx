'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/constants';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-100">
            <div className="container mx-auto px-4 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16">
                    {/* Section 1: Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <h3 className="text-2xl font-heading font-bold text-primary tracking-tight">
                                Amrutha
                            </h3>
                        </Link>
                        <p className="text-sm text-zinc-500 leading-relaxed max-w-xs italic">
                            Your trusted source for pure, naturally grown products.<br />
                            Bringing health and wellness to your doorstep.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-zinc-400 hover:text-secondary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-secondary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-zinc-400 hover:text-secondary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Section 2: General */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">General</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Why Us</Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Terms Of Service</Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Return & Refund Policy</Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Shipping & Delivery Policy</Link>
                            </li>
                            <li>
                                <Link href="/" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Section 3: Customer Service */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Customer Service</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/orders" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Track Order</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-zinc-500 hover:text-secondary transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <Link href={`https://wa.me/${CONTACT_CONFIG.WHATSAPP_PHONE}`} target="_blank" className="text-sm text-zinc-500 hover:text-secondary transition-colors">WhatsApp Us</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Section 4: Get In Touch */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Get In Touch</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-sm text-zinc-500">{CONTACT_CONFIG.PHONE}</p>
                                    <p className="text-[10px] text-zinc-400 uppercase font-medium">All Days, 9 AM-9 PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                <a href={`mailto:${CONTACT_CONFIG.EMAIL}`} className="text-sm text-zinc-500 hover:text-secondary truncate block">
                                    {CONTACT_CONFIG.EMAIL}
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Dispatch Centre 1</p>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Lakshmi Nagar Colony, Suraram,<br />
                                            Hyderabad – 500055
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Dispatch Centre 2</p>
                                        <p className="text-sm text-zinc-500 leading-relaxed">
                                            Sai Rajeswari Phase II, Ameenpur,<br />
                                            Hyderabad - 502032
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-zinc-400">
                        © {new Date().getFullYear()} Amrutha. All rights reserved.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 items-center text-[11px] font-medium text-zinc-400 uppercase tracking-widest">
                        <Link href="/" className="hover:text-secondary transition-colors">Privacy Policy</Link>
                        <Link href="/" className="hover:text-secondary transition-colors">Terms of Service</Link>
                        <Link
                            href="https://www.digitalarc.space"
                            target="_blank"
                            className="bg-zinc-50 px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-all border border-zinc-100"
                        >
                            Designed by Digital Arc
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
