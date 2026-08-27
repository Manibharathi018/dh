"use client";

import Link from "next/link";
import { ArrowLeft, Truck, Clock, ShieldCheck } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <main className="bg-white min-h-screen py-16 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="border-b border-gray-100 pb-10 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold block mb-2">
            Pan-India Delivery
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-gray-900">
            Shipping & Delivery Policy
          </h1>
        </div>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
              <Truck className="w-5 h-5 text-black mb-2" />
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Free Shipping</h3>
              <p className="text-xs text-gray-600 mt-1">Free standard shipping across India on prepaid orders.</p>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
              <Clock className="w-5 h-5 text-black mb-2" />
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Dispatch Time</h3>
              <p className="text-xs text-gray-600 mt-1">Orders dispatched within 24–48 hours from our Chennai outlet.</p>
            </div>
            <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
              <ShieldCheck className="w-5 h-5 text-black mb-2" />
              <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Order Tracking</h3>
              <p className="text-xs text-gray-600 mt-1">Real-time SMS & email tracking updates for every order.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-heading font-medium text-gray-900">Delivery Timelines</h2>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li><strong>Chennai & Tamil Nadu:</strong> 1 – 3 Business Days</li>
              <li><strong>Metro Cities:</strong> 3 – 5 Business Days</li>
              <li><strong>Rest of India:</strong> 5 – 7 Business Days</li>
            </ul>
          </div>
        </div>

      </div>
    </main>
  );
}
