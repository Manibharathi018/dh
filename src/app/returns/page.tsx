"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ReturnsPolicyPage() {
  return (
    <main className="bg-white min-h-screen py-16 text-gray-900 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        <Link href="/" className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-10 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="border-b border-gray-100 pb-10 mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500 font-semibold block mb-2">
            Customer Guarantee
          </span>
          <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-gray-900">
            Returns, Exchange & Refund Policy
          </h1>
        </div>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">
          <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm flex items-start space-x-4">
            <RotateCcw className="w-6 h-6 text-black shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-base text-gray-900">Hassle-Free 7-Day Exchange</h3>
              <p className="text-xs text-gray-600 mt-1">
                At Dhanya Factory Outlet, customer satisfaction is our top priority. We offer a 7-day exchange policy for size or defect adjustments.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-heading font-medium text-gray-900">1. Eligibility for Returns & Exchanges</h2>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Items must be unused, unwashed, and in original condition with tags intact.</li>
              <li>Valid proof of purchase (Order ID / Tax Invoice) is required.</li>
              <li>Footwear must be returned in the original shoe box undamaged.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-heading font-medium text-gray-900">2. In-Store & Online Exchanges</h2>
            <p>
              You can exchange any online purchase directly at our store:
              <br />
              <strong className="text-gray-900">DHANYA FACTORY OUTLET</strong>, Flat No B 52/59, Ground Floor, 70 Feet Road, Siva Elango Salai, Periyar Nagar West, Chennai - 600082.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-heading font-medium text-gray-900">3. Refund Process</h2>
            <p>
              Approved refunds for returned items will be processed back to your original Razorpay payment method within 5–7 business days.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
