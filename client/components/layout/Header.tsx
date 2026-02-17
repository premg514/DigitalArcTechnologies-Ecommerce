'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const categories = [
    { name: 'All Products', href: '/products' },
    { name: 'Organic Foods', href: '/products?category=organic' },
    { name: 'Health & Wellness', href: '/products?category=health' },
    { name: 'Kitchen Essentials', href: '/products?category=kitchen' },
    { name: 'Natural Sweeteners', href: '/products?category=sweeteners' },
];

export default function Header() {
    const { getTotalItems } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

    const cartItemsCount = getTotalItems();

    return (
        <header className="w-full border-b border-[var(--border-light)] bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="flex flex-col">
                            <span className="text-2xl md:text-3xl font-heading font-semibold text-primary">
                                Amrutha
                            </span>
                            <span className="text-xs text-brown-muted tracking-wide">
                                Pure & Natural
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>



                        <Link
                            href="/about"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            About Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        <Link
                            href="/contact"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            Contact Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {isAuthenticated && (
                            <Link
                                href="/orders"
                                className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                            >
                                Orders
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="text-sm font-medium text-accent hover:text-accent-light transition-colors"
                            >
                                Admin Panel
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Search */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden sm:flex text-sage-soft hover:text-secondary hover:bg-cream-beige hover:scale-105 transition-all duration-200 cursor-pointer"
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-sage-soft hover:text-secondary hover:bg-cream-beige hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-xs text-white flex items-center justify-center font-medium shadow-sm">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* User */}
                        {isAuthenticated ? (
                            <Link href="/profile">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-sage-soft hover:text-secondary hover:bg-cream-beige hover:scale-105 transition-all duration-200 cursor-pointer"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <Button
                                    size="sm"
                                    className="bg-secondary hover:bg-secondary-dark text-white font-medium"
                                >
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-sage-soft hover:text-secondary hover:bg-cream-beige"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 space-y-1 border-t border-[var(--border-light)] animate-slideDown">
                        <Link
                            href="/"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>


                        <Link
                            href="/about"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            About Us
                        </Link>

                        <Link
                            href="/contact"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary rounded-md transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Contact Us
                        </Link>

                        {isAuthenticated && (
                            <Link
                                href="/orders"
                                className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary rounded-md transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                My Orders
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="block px-4 py-3 text-sm font-medium text-accent hover:bg-cream-beige rounded-md transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Admin Panel
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
