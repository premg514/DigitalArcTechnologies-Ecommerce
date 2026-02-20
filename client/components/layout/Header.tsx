'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useProducts';
import { useState } from 'react';

export default function Header() {
    const { getTotalItems } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { data: dynamicCategories } = useCategories();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shopDropdownOpen, setShopDropdownOpen] = useState(false);

    const cartItemsCount = getTotalItems();

    return (
        <header className="w-full border-b border-[var(--border-light)] bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between relative">
                    {/* Hamburger Icon - Left Corner on Mobile */}
                    <div className="flex lg:hidden items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-sage-soft hover:text-secondary hover:bg-cream-beige"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>

                    {/* Logo - Middle on Mobile, Left on Desktop */}
                    <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                                <span className="text-xl md:text-2xl font-heading font-bold text-primary tracking-tight">
                                    Amrutha
                                </span>
                                <span className="text-[10px] text-brown-muted tracking-[0.15em] font-medium uppercase">
                                    Pure & Natural
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        <div className="relative group/shop">
                            <button className="flex items-center gap-1 text-sm font-medium text-sage-soft hover:text-secondary transition-colors">
                                Shop <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute top-full left-0 w-48 bg-white border border-border-light shadow-xl rounded-lg py-2 opacity-0 invisible group-hover/shop:opacity-100 group-hover/shop:visible transition-all z-50">
                                {dynamicCategories?.map((category) => (
                                    <Link
                                        key={category}
                                        href={`/products?category=${category}`}
                                        className="block px-4 py-2 text-sm text-sage-muted hover:bg-cream-beige hover:text-secondary"
                                    >
                                        {category}
                                    </Link>
                                ))}
                                <div className="border-t border-border-light mt-1 pt-1">
                                    <Link
                                        href="/products"
                                        className="block px-4 py-2 text-sm font-semibold text-secondary hover:bg-cream-beige"
                                    >
                                        Shop All
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/#why-us"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            Why Us
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        <Link
                            href="/contact"
                            className="text-sm font-medium text-sage-soft hover:text-secondary transition-colors relative group"
                        >
                            Help
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
                    </nav>

                    {/* Actions - Top Right */}
                    <div className="flex items-center space-x-1 sm:space-x-2">

                        {/* User/Account Icon */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-1">
                                {user?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hidden md:flex items-center gap-2 text-primary font-bold hover:bg-zinc-100"
                                        >
                                            Admin
                                        </Button>
                                    </Link>
                                )}
                                <Link href="/profile">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-sage-soft hover:text-secondary hover:bg-cream-beige transition-all cursor-pointer"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-sage-soft hover:text-secondary hover:bg-cream-beige transition-all cursor-pointer"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}

                        {/* Cart Icon */}
                        <Link href="/cart">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative text-sage-soft hover:text-secondary hover:bg-cream-beige transition-all cursor-pointer"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-[var(--border-light)] animate-slideDown overflow-y-auto max-h-[calc(100vh-80px)]">
                        <Link
                            href="/"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>

                        {/* Shop with Dropdown for Mobile */}
                        <div className="space-y-1">
                            <button
                                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary transition-colors"
                            >
                                Shop
                                <ChevronDown className={`h-4 w-4 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {shopDropdownOpen && (
                                <div className="bg-zinc-50/50 py-1 pl-4">
                                    {dynamicCategories?.map((category) => (
                                        <Link
                                            key={category}
                                            href={`/products?category=${category}`}
                                            className="block px-4 py-2.5 text-sm text-sage-muted hover:text-secondary transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/products"
                                        className="block px-4 py-2.5 text-sm font-semibold text-secondary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Shop All
                                    </Link>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/#why-us"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Why Us
                        </Link>

                        <Link
                            href="/contact"
                            className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Help
                        </Link>

                        {isAuthenticated && (
                            <Link
                                href="/orders"
                                className="block px-4 py-3 text-sm font-medium text-sage-soft hover:bg-cream-beige hover:text-secondary transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Orders
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="block px-4 py-3 text-sm font-semibold text-accent hover:bg-cream-beige rounded-md transition-colors mt-4 border-t border-dashed border-zinc-200"
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
