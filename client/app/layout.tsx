import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import SocketProvider from "@/components/providers/SocketProvider";
import ScrollToTop from "@/components/layout/ScrollToTop";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Amrutha - Pure & Natural Products",
  description: "Your trusted source for pure, organic, and naturally grown products. Bringing health and wellness to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <SocketProvider>
            <ScrollToTop />
            {children}
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

