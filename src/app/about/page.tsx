"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen py-16 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="border-b border-gray-100 pb-10 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold block mb-2">
            Our Brand Story
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-gray-900">
            About Dhanya Factory Outlet
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <p className="text-base text-gray-800 font-medium">
            Welcome to <span className="font-bold text-black">DHANYA FACTORY OUTLET</span> — your premier destination for authentic, high-quality fashion, clothing, and footwear in Chennai.
          </p>

          <p>
            Located at Periyar Nagar West, Chennai, we pride ourselves on offering curated global fashion collections, premium apparel, and accessories at accessible factory-outlet prices.
          </p>

          <div className="bg-rose-50/60 p-6 border border-rose-100 rounded-sm my-8 flex items-center space-x-4 text-rose-900">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Women-Owned Enterprise</h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Dhanya Factory Outlet proudly identifies as a women-owned business dedicated to empowering choice, quality, and style.
              </p>
            </div>
          </div>

          {/* Store Info Card */}
          <div className="bg-gray-50 p-8 border border-gray-100 rounded-sm space-y-4 my-8">
            <h3 className="font-heading font-medium text-lg text-gray-900 border-b border-gray-200 pb-3">
              Store Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700 pt-2">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block mb-0.5">Address</span>
                  Flat No B 52/59, Ground Floor, 70 Feet Road, Siva Elango Salai, Periyar Nagar West, Chennai, Tamil Nadu 600082
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 shrink-0 text-gray-900 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block mb-0.5">Contact</span>
                  <a href="tel:+919629850010" className="hover:underline font-medium text-black">096298 50010</a><br />
                  <a href="mailto:dhanyafactoryoutlet@gmail.com" className="hover:underline text-gray-600">dhanyafactoryoutlet@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-900 block mb-0.5">Timings</span>
                  Open · Closes 10:00 PM (10:00 AM - 10:00 PM Daily)
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Link href="/contact" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-black border-b border-black pb-0.5 hover:text-gray-600">
                  Visit Contact Page &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
