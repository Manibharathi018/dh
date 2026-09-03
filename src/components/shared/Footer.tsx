"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Minus } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: false,
    service: false,
    information: false,
  });

  // Don't render footer on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100 text-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
        
        {/* ── DESKTOP VIEW (md & above) ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 lg:gap-14 text-sm">
          
          {/* Column 1: PRODUCTS */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 mb-6 font-medium">
              PRODUCTS
            </h3>
            <ul className="space-y-3.5 text-[13px] tracking-wider uppercase text-gray-700">
              <li>
                <Link href="/men" className="hover:text-black transition-colors">
                  NEW ARRIVAL
                </Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-black transition-colors">
                  SHIRTS
                </Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-black transition-colors">
                  T-SHIRTS
                </Link>
              </li>
              <li>
                <Link href="/men" className="hover:text-black transition-colors">
                  TROUSERS
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: SERVICE */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 mb-6 font-medium">
              SERVICE
            </h3>
            <ul className="space-y-3.5 text-[13px] text-gray-700">

              <li>
                <Link href="/contact" className="hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: INFORMATION */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 mb-6 font-medium">
              INFORMATION
            </h3>
            <ul className="space-y-3.5 text-[13px] text-gray-700">
              <li>
                <a
                  href="https://dhanya-fashion-outlet-new.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <Link href="/returns" className="hover:text-black transition-colors">
                  Returns, Exchange and Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-black transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="hover:text-black transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: SUPPORT */}
          <div>
            <h3 className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 mb-6 font-medium">
              SUPPORT
            </h3>
            <div className="text-[13px] text-gray-700 space-y-4 leading-relaxed">
              <div>
                <p className="font-bold text-gray-900 tracking-wide uppercase">
                  DHANYA FACTORY OUTLET
                </p>
                <p className="text-gray-600 mt-1 leading-relaxed">
                  Flat No B 52/59, Ground Floor,<br />
                  70 Feet Road, Siva Elango Salai,<br />
                  Periyar Nagar West, Chennai,<br />
                  Tamil Nadu 600082
                </p>
              </div>

              <div className="pt-2 space-y-1">
                <p className="text-gray-900 font-medium">
                  <a href="tel:+919629850010" className="hover:underline">
                    096298 50010
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="mailto:dhanyafactoryoutlet@gmail.com" className="hover:underline">
                    dhanyafactoryoutlet@gmail.com
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="https://dfoclothing.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    dfoclothing.com
                  </a>
                </p>
                <p className="text-gray-600 mt-1 text-xs">
                  Open · Closes 10 pm
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── MOBILE VIEW (under md) with Accordions ── */}
        <div className="md:hidden space-y-0 text-sm">
          
          {/* Accordion 1: PRODUCTS */}
          <div className="border-b border-gray-200 py-4">
            <button
              onClick={() => toggleSection("products")}
              className="w-full flex justify-between items-center text-left py-1"
            >
              <span className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 font-normal">
                PRODUCTS
              </span>
              <span className="text-gray-500">
                {openSections.products ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </span>
            </button>
            {openSections.products && (
              <ul className="pt-3 pb-2 space-y-2.5 text-xs tracking-wider uppercase text-gray-600 animate-in fade-in">
                <li>
                  <Link href="/men" className="hover:text-black transition-colors block py-1">
                    NEW ARRIVAL
                  </Link>
                </li>
                <li>
                  <Link href="/men" className="hover:text-black transition-colors block py-1">
                    SHIRTS
                  </Link>
                </li>
                <li>
                  <Link href="/men" className="hover:text-black transition-colors block py-1">
                    T-SHIRTS
                  </Link>
                </li>
                <li>
                  <Link href="/men" className="hover:text-black transition-colors block py-1">
                    TROUSERS
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 2: SERVICE */}
          <div className="border-b border-gray-200 py-4">
            <button
              onClick={() => toggleSection("service")}
              className="w-full flex justify-between items-center text-left py-1"
            >
              <span className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 font-normal">
                SERVICE
              </span>
              <span className="text-gray-500">
                {openSections.service ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </span>
            </button>
            {openSections.service && (
              <ul className="pt-3 pb-2 space-y-2.5 text-xs text-gray-600 animate-in fade-in">

                <li>
                  <Link href="/contact" className="hover:text-black transition-colors block py-1">
                    Contact
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 3: INFORMATION */}
          <div className="border-b border-gray-200 py-4">
            <button
              onClick={() => toggleSection("information")}
              className="w-full flex justify-between items-center text-left py-1"
            >
              <span className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 font-normal">
                INFORMATION
              </span>
              <span className="text-gray-500">
                {openSections.information ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </span>
            </button>
            {openSections.information && (
              <ul className="pt-3 pb-2 space-y-2.5 text-xs text-gray-600 animate-in fade-in">
                <li>
                  <a
                    href="https://dhanya-fashion-outlet-new.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors block py-1"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-black transition-colors block py-1">
                    Returns, Exchange and Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-black transition-colors block py-1">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation" className="hover:text-black transition-colors block py-1">
                    Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-black transition-colors block py-1">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Static SUPPORT Section */}
          <div className="pt-8 pb-4">
            <h3 className="text-sm font-sans tracking-[0.18em] uppercase text-gray-900 mb-4 font-normal">
              SUPPORT
            </h3>
            <div className="text-xs text-gray-600 space-y-4 leading-relaxed">
              <div>
                <p className="font-bold text-gray-900 text-sm tracking-wide uppercase">
                  DHANYA FACTORY OUTLET
                </p>
                <p className="mt-1.5 leading-relaxed">
                  Flat No B 52/59, Ground Floor,<br />
                  70 Feet Road, Siva Elango Salai,<br />
                  Periyar Nagar West, Chennai,<br />
                  Tamil Nadu 600082
                </p>
              </div>

              <div className="pt-1 space-y-1">
                <p className="text-gray-900 font-medium">
                  <a href="tel:+919629850010" className="hover:underline">
                    096298 50010
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="mailto:dhanyafactoryoutlet@gmail.com" className="hover:underline">
                    dhanyafactoryoutlet@gmail.com
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="https://dfoclothing.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    dfoclothing.com
                  </a>
                </p>
                <p className="text-gray-500 pt-1 text-xs">
                  Open · Closes 10 pm
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM COPYRIGHT BAR ── */}
      <div className="border-t border-gray-100 py-6 text-center text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50/50">
        <p>
          &copy; {new Date().getFullYear()} DHANYA FACTORY OUTLET. All rights reserved. <br className="md:hidden" />
          <span className="md:ml-2 mt-2 md:mt-0 inline-block">
            Designed & Developed by <a href="#" className="font-semibold text-gray-800 hover:text-black transition-colors">Qelanto Technologies</a>
          </span>
        </p>
      </div>
    </footer>
  );
}
