import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="sticky top-0 z-50 w-full">
                <AnnouncementBanner />
                <Header />
            </div>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

