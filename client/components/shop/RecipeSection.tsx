'use client';

import {
    Clock,
    Users,
    Utensils,
    ListChecks,
    ArrowRight,
    X
} from "lucide-react";
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";

const recipes = [
    {
        title: 'Organic Rice Sambar',
        category: 'Rice',
        prepTime: '20 min',
        servings: '4',
        image: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771585915/indian_rice_village_hero_1771585454404_ufscxg.jpg',
        description: 'A traditional South Indian comfort food made with our single polished rice and fresh vegetables.',
        ingredients: [
            '1 cup Amrutha Single Polished Rice',
            '1/2 cup Toor Dal',
            'Mixed vegetables (drumstick, carrot, pumpkin)',
            'Sambar powder & Tamarind pulp',
            'Mustard seeds & Curry leaves for tempering'
        ],
        instructions: [
            'Pressure cook the dal and vegetables until soft.',
            'Prepare tamarind water and add sambar powder, salt, and cooked vegetables.',
            'In a separate pan, temper mustard seeds, red chilies, and curry leaves.',
            'Mix everything together and simmer for 10 minutes.',
            'Serve hot with freshly cooked Amrutha Rice.'
        ]
    },
    {
        title: 'Authentic Jaggery Sweet',
        category: 'Jaggery',
        prepTime: '15 min',
        servings: '6',
        image: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771586111/Gemini_Generated_Image_4t667o4t667o4t66_ylenr8.png',
        description: 'Made with pure chemical-free jaggery, this sweet treat is healthy and rooted in tradition.',
        ingredients: [
            '2 cups Amrutha Pure Jaggery (grated)',
            '1 cup Rice flour',
            '1/4 cup Ghee',
            'Cardamom powder',
            'Dry fruits for garnishing'
        ],
        instructions: [
            'Melt the jaggery in a small amount of water to make a syrup.',
            'Strain the syrup to remove any impurities.',
            'Slowly add rice flour to the boiling syrup while stirring constantly.',
            'Add ghee and cardamom powder, continue stirring until it thickens.',
            'Garnish with roasted dry fruits and let it cool.'
        ]
    },
    {
        title: 'Crunchy Nut Mix',
        category: 'Nuts',
        prepTime: '5 min',
        servings: '2',
        image: 'https://res.cloudinary.com/deeejohfw/image/upload/v1771585915/hero_cashew_orchard_premium_1771585639697_bhaxua.jpg',
        description: 'A quick energy booster using our handpicked jumbo cashews and premium selection of nuts.',
        ingredients: [
            '1 cup Amrutha Jumbo Cashews',
            '1/2 cup Almonds',
            '1/4 cup Pumpkin seeds',
            'A pinch of sea salt',
            'Organic honey (optional)'
        ],
        instructions: [
            'Lightly roast the cashews and almonds in a pan until golden.',
            'Add pumpkin seeds and roast for another minute.',
            'Sprinkle a pinch of sea salt while they are warm.',
            'Drizzle with honey if you prefer a sweet-salty snack.',
            'Store in an airtight container for lasting crunch.'
        ]
    }
];

export default function RecipeSection() {
    return (
        <section className="py-24 bg-[#FAF9F6]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-4 block">
                        Cook with Amrutha
                    </span>
                    <h2 className="text-3xl md:text-5xl font-heading font-bold text-primary">
                        Recipes Using Our Products
                    </h2>
                    <div className="w-20 h-1 bg-secondary/20 mx-auto mt-6 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recipes.map((recipe) => (
                        <div key={recipe.title} className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-zinc-100">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold text-secondary uppercase tracking-wider shadow-sm">
                                    {recipe.category}
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-4 text-zinc-400 text-xs mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {recipe.prepTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {recipe.servings} Servings
                                    </div>
                                </div>

                                <h3 className="text-xl font-heading font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                                    {recipe.title}
                                </h3>

                                <p className="text-sm text-zinc-500 leading-relaxed mb-6 line-clamp-2">
                                    {recipe.description}
                                </p>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full bg-secondary hover:bg-secondary-dark text-white rounded-xl h-12 font-bold transition-all group-hover:shadow-lg group-hover:shadow-secondary/20">
                                            View Recipe
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide rounded-2xl p-0 border-none shadow-2xl bg-white">
                                        <div className="p-10 md:p-16">
                                            {/* Header Section */}
                                            <div className="mb-12">
                                                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block animate-fadeIn">
                                                    Traditional {recipe.category}
                                                </span>
                                                <DialogTitle className="text-4xl md:text-6xl font-heading font-bold text-primary leading-tight animate-slideUp">
                                                    {recipe.title}
                                                </DialogTitle>
                                                <div className="w-24 h-1 bg-secondary/30 mt-8 rounded-full animate-fadeIn" />
                                            </div>

                                            {/* Meta Info Bar */}
                                            <div className="flex flex-wrap gap-12 mb-16 pb-12 border-b border-zinc-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Preparation</span>
                                                    <span className="text-lg font-bold text-primary flex items-center gap-3">
                                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                                            <Clock className="h-5 w-5 text-secondary" />
                                                        </div>
                                                        {recipe.prepTime}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Capacity</span>
                                                    <span className="text-lg font-bold text-primary flex items-center gap-3">
                                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                                            <Users className="h-5 w-5 text-secondary" />
                                                        </div>
                                                        {recipe.servings} Servings
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Difficulty</span>
                                                    <span className="text-lg font-bold text-primary flex items-center gap-3">
                                                        <div className="p-2 bg-secondary/10 rounded-lg">
                                                            <Utensils className="h-5 w-5 text-secondary" />
                                                        </div>
                                                        Easy
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
                                                {/* Ingredients Column */}
                                                <div className="lg:col-span-2">
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <h4 className="text-2xl font-heading font-bold text-primary">Ingredients</h4>
                                                        <div className="flex-grow h-[1px] bg-gradient-to-r from-secondary/30 to-transparent" />
                                                    </div>
                                                    <ul className="space-y-6">
                                                        {recipe.ingredients.map((item, id) => (
                                                            <li key={id} className="flex items-start gap-4 group/item">
                                                                <div className="mt-2 h-2 w-2 rounded-full bg-secondary ring-4 ring-secondary/10 transition-transform group-hover/item:scale-150" />
                                                                <span className="text-base text-zinc-600 font-medium leading-tight">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Instructions Column */}
                                                <div className="lg:col-span-3">
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <h4 className="text-2xl font-heading font-bold text-primary">The Process</h4>
                                                        <div className="flex-grow h-[1px] bg-gradient-to-r from-secondary/30 to-transparent" />
                                                    </div>
                                                    <ol className="space-y-10">
                                                        {recipe.instructions.map((step, id) => (
                                                            <li key={id} className="relative pl-12 group/step">
                                                                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary/20 transition-transform group-hover/step:scale-110">
                                                                    {id + 1}
                                                                </span>
                                                                <div className="bg-zinc-50/50 p-6 rounded-2xl border border-transparent transition-all group-hover/step:border-zinc-200 group-hover/step:bg-white group-hover/step:shadow-sm">
                                                                    <p className="text-base text-zinc-600 leading-relaxed font-medium">{step}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center animate-fadeIn">
                    <p className="text-sage-muted italic text-lg mb-2">
                        And many more like these...
                    </p>
                    <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em] opacity-60">
                        Discover the authentic taste of tradition
                    </p>
                </div>
            </div>
        </section>
    );
}
