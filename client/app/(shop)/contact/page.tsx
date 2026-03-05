'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Loader2, Facebook, Twitter, Instagram, User2, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { CONTACT_CONFIG } from '@/lib/constants';

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('first_name');
        const lastName = formData.get('last_name');
        const email = formData.get('email');
        const phoneNo = formData.get('phone');
        const subject = formData.get('inquiry_type');
        const message = formData.get('message');

        const text = `*New Inquiry from Website*\n\n*Name:* ${firstName} ${lastName}\n*Email:* ${email}\n*Phone:* ${phoneNo}\n*Subject:* ${subject}\n*Message:* ${message}`;
        const whatsappUrl = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;

        window.open(whatsappUrl, '_blank');

        setIsSubmitting(false);
        setIsSent(true);
        toast.success('Redirecting to WhatsApp...');
    };

    return (
        <div className="bg-white min-h-screen py-12 md:py-24">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Header */}
                <div className="text-center space-y-3 mb-12 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-semibold text-primary tracking-tight">
                        Contact Us
                    </h1>
                    <p className="text-muted-foreground text-base font-medium">
                        Any question or remarks? Just write us a message!
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-[0_10px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row p-2 min-h-[660px]">
                    {/* Left: Contact Information Sidebar */}
                    <div className="lg:w-[440px] bg-primary-dark rounded-xl p-10 relative overflow-hidden flex flex-col text-white shadow-2xl" style={{ backgroundColor: '#5A1515' }}>
                        <div className="relative z-10 flex-1">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 !text-white uppercase tracking-tight">Contact Information</h2>
                            <p className="text-white text-sm mb-12 font-medium opacity-90">
                                Fill up the form and our Team will get back to you within 24 hours.
                            </p>

                            <div className="space-y-10">
                                <div className="flex items-center gap-6 group">
                                    <Phone className="h-6 w-6 text-accent-golden group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{CONTACT_CONFIG.PHONE}</span>
                                </div>
                                <div className="flex items-center gap-6 group">
                                    <Mail className="h-6 w-6 text-accent-golden group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{CONTACT_CONFIG.EMAIL}</span>
                                </div>
                                <div className="flex items-start gap-6 group">
                                    <MapPin className="h-6 w-6 text-accent-golden group-hover:scale-110 transition-transform flex-shrink-0" />
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] text-accent-golden font-bold uppercase tracking-wider mb-1">Dispatch Centre 1</p>
                                            <p className="text-sm font-medium leading-relaxed">
                                                Lakshmi Nagar Colony, Suraram,<br />
                                                Hyderabad – 500055
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-accent-golden font-bold uppercase tracking-wider mb-1">Dispatch Centre 2</p>
                                            <p className="text-sm font-medium leading-relaxed">
                                                Sai Rajeswari Phase II, Ameenpur,<br />
                                                Hyderabad - 502032
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="relative z-10 flex gap-4 mt-auto">
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors">
                                <div className="font-bold text-[10px]">in</div>
                            </a>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent-golden/10 pointer-events-none" />
                        <div className="absolute bottom-12 right-20 w-32 h-32 rounded-full bg-accent-golden/20 pointer-events-none" />
                    </div>

                    {/* Right: Form Area */}
                    <div className="flex-1 p-8 md:p-12">
                        {isSent ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-primary font-heading">Message Sent!</h2>
                                    <p className="text-muted-foreground font-medium">Thank you for reaching out. We'll be in touch soon.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSent(false)}
                                    className="rounded-lg h-12 px-8 font-semibold text-sm"
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Form Grid */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">First Name</label>
                                        <div className="relative">
                                            <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                required
                                                name="first_name"
                                                type="text"
                                                placeholder="First Name"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Last Name</label>
                                        <div className="relative">
                                            <User2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                required
                                                name="last_name"
                                                type="text"
                                                placeholder="Doe"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                required
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                            <Input
                                                required
                                                name="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Inquiry Type */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary">Select Subject?</h3>
                                    <div className="flex flex-wrap gap-6">
                                        {[
                                            'General Inquiry',
                                            'Order Support',
                                            'Bulk Order',
                                            'Other'
                                        ].map((option) => (
                                            <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                                <div className="relative w-4 h-4 flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="inquiry_type"
                                                        value={option}
                                                        className="peer appearance-none w-4 h-4 rounded-full border border-[#e0e0e0] checked:border-secondary transition-all !focus:outline-none !focus:ring-0 !focus-visible:outline-none !focus-visible:ring-0 absolute inset-0"
                                                        defaultChecked={option === 'General Inquiry'}
                                                    />
                                                    <div className="w-2 h-2 rounded-full bg-secondary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none z-10" />
                                                </div>
                                                <span className="text-xs font-medium text-foreground/70 group-hover:text-primary transition-colors">
                                                    {option}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Message</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                                        <textarea
                                            required
                                            name="message"
                                            rows={4}
                                            className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background text-foreground font-medium resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
                                            placeholder="Write your message.."
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-12 bg-secondary hover:bg-secondary-dark text-white rounded-md shadow-lg font-semibold transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Message'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
