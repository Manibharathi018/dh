"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Globe, Heart, ArrowLeft } from "lucide-react";
import shopimage from "@/assets/shopimage.jpg";

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen py-16 text-gray-900 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="border-b border-gray-100 pb-10 mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold block mb-2">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-gray-900">
            Contact Us
          </h1>
          <p className="text-gray-600 mt-3 max-w-xl text-sm leading-relaxed">
            Visit our outlet store in Chennai or reach out to us directly for inquiries, orders, and support.
          </p>
        </div>

        {/* Main Grid: Details + Map Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Direct Contact Information */}
          <div className="space-y-8">
            {/* Storefront Image */}
            <div className="relative aspect-[4/3] w-full rounded-sm overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
              <Image
                src={shopimage}
                alt="Dhanya Factory Outlet Storefront"
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            <div className="bg-gray-50 p-8 border border-gray-100 rounded-sm space-y-6">
              <h2 className="text-xl font-heading font-medium tracking-tight text-gray-900 border-b border-gray-200 pb-4">
                DHANYA FACTORY OUTLET
              </h2>

              {/* Address */}
              <div className="flex items-start space-x-4 text-sm">
                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center shrink-0 rounded-full text-black shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Store Address</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Flat No B 52/59, Ground Floor,<br />
                    70 Feet Road, Siva Elango Salai,<br />
                    Periyar Nagar West, Chennai,<br />
                    Tamil Nadu 600082
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-2 bg-white px-2.5 py-1 border border-gray-200 inline-block rounded-sm">
                    Plus Code: 467H+H2 Chennai, Tamil Nadu
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4 text-sm pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center shrink-0 rounded-full text-black shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Phone Number</h3>
                  <a href="tel:+919629850010" className="text-gray-800 font-medium hover:underline text-base">
                    096298 50010
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">Call or WhatsApp for store inquiries</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4 text-sm pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center shrink-0 rounded-full text-black shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Email ID</h3>
                  <a href="mailto:dhanyafactoryoutlet@gmail.com" className="text-gray-800 font-medium hover:underline">
                    dhanyafactoryoutlet@gmail.com
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">Customer support & inquiries</p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-start space-x-4 text-sm pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center shrink-0 rounded-full text-black shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Website</h3>
                  <a href="https://dfoclothing.com" target="_blank" rel="noopener noreferrer" className="text-gray-800 font-medium hover:underline">
                    dfoclothing.com
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4 text-sm pt-4 border-t border-gray-200/60">
                <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center shrink-0 rounded-full text-emerald-600 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-1">Store Timings</h3>
                  <p className="text-emerald-700 font-medium text-sm">
                    Open · Closes 10:00 PM
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Monday to Sunday: 10:00 AM – 10:00 PM</p>
                </div>
              </div>

              {/* Business Badge */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200/60 text-xs text-rose-700 bg-rose-50/50 p-3 rounded-sm">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500 shrink-0" />
                <span className="font-medium">Identifies as a Women-Owned Business</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Frame */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 border border-gray-100 rounded-sm">
              <h3 className="font-heading font-medium text-lg mb-3 px-2">Store Location Map</h3>
              <div className="aspect-[4/3] w-full rounded-sm overflow-hidden border border-gray-200 shadow-sm relative">
                <iframe
                  title="Dhanya Factory Outlet Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.834045582375!2d80.21786!3d13.10988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzM1LjYiTiA4MMKwMTMnMDQuMyJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[320px]"
                ></iframe>
              </div>
              <div className="mt-4 px-2 flex justify-between items-center text-xs text-gray-500">
                <span>Periyar Nagar West, Chennai</span>
                <a
                  href="https://maps.google.com/?q=Flat+No+B+52/59,+Ground+Floor,+70+Feet+Road,+Siva+Elango+Salai,+Periyar+Nagar+West,+Chennai,+Tamil+Nadu+600082"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-black underline hover:text-rose-600"
                >
                  Open in Google Maps &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
