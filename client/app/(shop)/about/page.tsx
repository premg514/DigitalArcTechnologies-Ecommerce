import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Award, Heart, Truck } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-6">
                    About Amrutha
                </h1>
                <p className="text-lg text-sage-muted leading-relaxed">
                    At Amrutha, we believe in the purity of nature. Our mission is to bring you the finest organic products,
                    cultivated with care and delivered with love. "Amrutha" means nectar of immortality, and we strive to
                    provide products that nourish your body and soul.
                </p>
            </div>

            {/* Values Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                <Card className="border-none shadow-organic hover:shadow-organic-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Leaf className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-primary mb-2">Premium Quality</h3>
                        <p className="text-sage-muted text-sm">
                            Specializing in First Polished Rice, ensuring you get the perfect balance of taste and nutrition.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-organic hover:shadow-organic-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                            <Award className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-primary mb-2">Quality First</h3>
                        <p className="text-sage-muted text-sm">
                            Rigorous quality checks ensure that only the best products reach your kitchen.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-organic hover:shadow-organic-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <Heart className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-primary mb-2">Made with Love</h3>
                        <p className="text-sage-muted text-sm">
                            We support local communities and fair trade practices to ensure everyone grows together.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-organic hover:shadow-organic-lg transition-shadow">
                    <CardContent className="pt-6 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-primary mb-2">Fast Delivery</h3>
                        <p className="text-sage-muted text-sm">
                            Quick and reliable delivery to your doorstep, ensuring freshness in every package.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Our Specialties Section */}
            <div className="mb-20">
                <h2 className="text-3xl font-heading font-bold text-primary text-center mb-12">Our Specialties</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Rice */}
                    <Card className="overflow-hidden group hover:shadow-organic-lg transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <Image
                                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2670&auto=format&fit=crop"
                                alt="First Polished Rice"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <h3 className="text-xl font-heading font-bold">First Polished Rice</h3>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <p className="text-sage-muted text-sm leading-relaxed">
                                Our signature First Polished Rice retains the essential bran layer, offering superior nutrition and a distinct, nutty flavor that processed rice simply cannot match.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Jaggery */}
                    <Card className="overflow-hidden group hover:shadow-organic-lg transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <Image
                                src="https://images.unsplash.com/photo-1627485937980-221c88ac04f9?q=80&w=2574&auto=format&fit=crop"
                                alt="Organic Jaggery"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <h3 className="text-xl font-heading font-bold">Pure Jaggery</h3>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <p className="text-sage-muted text-sm leading-relaxed">
                                Made from the finest sugarcane, our Jaggery is processed without chemicals to preserve its natural minerals and rich, caramel-like sweetness.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Dry Fruits */}
                    <Card className="overflow-hidden group hover:shadow-organic-lg transition-all duration-300">
                        <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <Image
                                src="https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=2596&auto=format&fit=crop"
                                alt="Premium Dry Fruits"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <h3 className="text-xl font-heading font-bold">Premium Dry Fruits</h3>
                            </div>
                        </div>
                        <CardContent className="pt-6">
                            <p className="text-sage-muted text-sm leading-relaxed">
                                Sourced from the best orchards, our collection of almonds, cashews, and dates are packed with protein, healthy fats, and vitality.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Story Section */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop"
                        alt="Organic Farming"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-heading font-bold text-primary mb-6">Our Story</h2>
                    <div className="space-y-4 text-sage-muted">
                        <p>
                            Founded with a vision to reconnect people with nature, Amrutha started as a small initiative
                            to support local farmers. We specialize in bringing you the finest First Polished Rice,
                            pure Jaggery, and premium Dry Fruits. We realized that the gap between the producer and the consumer
                            was growing, leading to a compromise in quality and health.
                        </p>
                        <p>
                            Today, Amrutha is more than just a brand; it's a movement towards a healthier lifestyle.
                            We work closely with farmers to bring you products that are free from harmful chemicals
                            and full of natural goodness.
                        </p>
                        <p>
                            Every product you buy from Amrutha contributes to a sustainable future and supports the
                            livelihoods of those who work hard to feed the world.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
