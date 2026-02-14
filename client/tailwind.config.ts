import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary-maroon)',
                    light: 'var(--primary-maroon-light)',
                    dark: 'var(--primary-maroon-dark)',
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: 'var(--secondary-terracotta)',
                    light: 'var(--secondary-terracotta-light)',
                    dark: 'var(--secondary-terracotta-dark)',
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: 'var(--accent-golden)',
                    light: 'var(--accent-golden-light)',
                    dark: 'var(--accent-golden-dark)',
                    foreground: 'var(--text-dark)',
                },
                maroon: {
                    DEFAULT: 'var(--primary-maroon)',
                    light: 'var(--primary-maroon-light)',
                    dark: 'var(--primary-maroon-dark)',
                },
                terracotta: {
                    DEFAULT: 'var(--secondary-terracotta)',
                    light: 'var(--secondary-terracotta-light)',
                    dark: 'var(--secondary-terracotta-dark)',
                },
                golden: {
                    DEFAULT: 'var(--accent-golden)',
                    light: 'var(--accent-golden-light)',
                    dark: 'var(--accent-golden-dark)',
                },
                cream: {
                    DEFAULT: 'var(--bg-cream)',
                    light: 'var(--bg-light)',
                    beige: 'var(--bg-beige)',
                    warm: 'var(--bg-warm)',
                },
                sage: {
                    soft: 'var(--text-soft)',
                    muted: 'var(--text-muted)',
                    light: 'var(--text-light)',
                },
                // UI Component colors
                background: 'var(--bg-cream)',
                foreground: 'var(--text-dark)',
                card: {
                    DEFAULT: 'var(--bg-light)',
                    foreground: 'var(--text-dark)',
                },
                popover: {
                    DEFAULT: 'var(--bg-light)',
                    foreground: 'var(--text-dark)',
                },
                muted: {
                    DEFAULT: 'var(--bg-warm)',
                    foreground: 'var(--text-muted)',
                },
                destructive: {
                    DEFAULT: 'var(--secondary-terracotta)',
                    foreground: '#FFFFFF',
                },
                border: 'var(--border-light)',
                input: 'var(--border-light)',
                ring: 'var(--secondary-terracotta)',
            },
            fontFamily: {
                heading: ['"Gotham Medium"', 'var(--font-sans)', 'Montserrat', 'sans-serif'],
                body: ['"Gotham Medium"', 'var(--font-sans)', 'Montserrat', 'sans-serif'],
            },
            boxShadow: {
                'organic': '0 4px 6px -1px rgba(122, 31, 31, 0.12)',
                'organic-lg': '0 10px 15px -3px rgba(122, 31, 31, 0.15)',
            },
        },
    },
    plugins: [],
};

export default config;


