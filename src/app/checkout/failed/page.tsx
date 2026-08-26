"use client";

import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailedPage() {
  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20">
      <div className="container mx-auto px-6 max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-600 rounded-full">
          <XCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-heading font-medium tracking-tight">Payment Failed</h1>
        <p className="text-muted-foreground leading-relaxed">
          We couldn't verify your payment. Please try placing your order again, or contact support if the issue persists.
        </p>

        <div className="pt-8 space-y-3">
          <Link href="/checkout" className="block w-full">
            <Button className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-sm tracking-widest uppercase">
              Retry Checkout
            </Button>
          </Link>
          <Link href="/products" className="block w-full">
            <Button variant="outline" className="w-full h-14 rounded-none border-gray-200 text-foreground hover:bg-gray-50 text-sm tracking-widest uppercase">
              Return to Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
