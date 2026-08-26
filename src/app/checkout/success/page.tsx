"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const orderId = resolvedParams.orderId;

  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20">
      <div className="container mx-auto px-6 max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-full">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-heading font-medium tracking-tight">Order Placed!</h1>
        <p className="text-muted-foreground leading-relaxed">
          Thank you for your purchase. Your order {orderId ? `#${orderId}` : ""} is being processed. 
          We'll send you an email confirmation with tracking details shortly.
        </p>

        <div className="pt-8 space-y-3">
          <Link href="/products" className="block w-full">
            <Button className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-sm tracking-widest uppercase">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/dashboard" className="block w-full">
            <Button variant="outline" className="w-full h-14 rounded-none border-gray-200 text-foreground hover:bg-gray-50 text-sm tracking-widest uppercase">
              View Order History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
