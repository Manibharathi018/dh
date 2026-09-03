import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { CartDrawer } from "@/components/shared/CartDrawer";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dfoclothing.com"),
  alternates: {
    canonical: "./",
  },
  title: {
    template: "%s | DHANYA Factory Outlet",
    default: "DHANYA Factory Outlet | Premium Fashion",
  },
  description: "Shop premium fashion at factory prices. Discover the latest collections for men and women.",
  keywords: ["fashion", "factory outlet", "clothing", "premium fashion", "Dhanya"],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "DHANYA Factory Outlet",
    description: "Premium Fashion. Factory Prices.",
    type: "website",
    locale: "en_US",
    siteName: "DHANYA Factory Outlet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Navbar />
          <CartDrawer />
          <div className="flex-1 pt-[76px]">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
