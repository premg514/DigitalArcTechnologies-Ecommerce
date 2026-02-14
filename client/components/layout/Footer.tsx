'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-[var(--border-light)]">

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-heading font-bold text-primary">
                            Amrutha
                        </h3>
                        <p className="text-sm text-sage-muted leading-relaxed">
                            Your trusted source for pure, organic, and naturally grown products.
                            Bringing health and wellness to your doorstep.
                        </p>
                        <div className="flex space-x-3">
                            <a href="#" className="w-9 h-9 rounded-full bg-primary-light hover:bg-primary text-white flex items-center justify-center transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-primary-light hover:bg-primary text-white flex items-center justify-center transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-primary-light hover:bg-primary text-white flex items-center justify-center transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-primary-light hover:bg-primary text-white flex items-center justify-center transition-colors">
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-base font-heading font-semibold text-sage-soft mb-4">
                            Categories
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/products?category=First%20Polished%20Rice" className="text-sage-muted hover:text-primary transition-colors">
                                    First Polished Rice
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=Jaggery" className="text-sage-muted hover:text-primary transition-colors">
                                    Jaggery
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=Dry%20Fruits" className="text-sage-muted hover:text-primary transition-colors">
                                    Dry Fruits
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sage-muted hover:text-primary transition-colors font-medium">
                                    Shop All
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-base font-heading font-semibold text-sage-soft mb-4">
                            Customer Service
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link href="/contact" className="text-sage-muted hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-order" className="text-sage-muted hover:text-primary transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-sage-muted hover:text-primary transition-colors">
                                    Shipping & Delivery
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-sage-muted hover:text-primary transition-colors">
                                    Refund & Cancellation
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sage-muted hover:text-primary transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-base font-heading font-semibold text-sage-soft mb-4">
                            Get In Touch
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sage-muted">+91 1234567890</p>
                                    <p className="text-xs text-sage-light">Mon-Sat, 9AM-6PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@amrutha.com" className="text-sage-muted hover:text-primary transition-colors">
                                    info@amrutha.com
                                </a>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <p className="text-sage-muted">
                                    123 Organic Street,<br />
                                    Green City, India 400001
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-[var(--border-light)]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-sage-muted text-center md:text-left">
                            © {new Date().getFullYear()} Amrutha. All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <Link href="/privacy" className="text-sage-muted hover:text-primary transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-sage-muted hover:text-primary transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/sitemap" className="text-sage-muted hover:text-primary transition-colors">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
