"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-white min-h-[70vh] flex items-center justify-center py-20">
      <div className="container mx-auto px-6 max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 text-rose-600 rounded-full">
          <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-heading font-medium tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground leading-relaxed">
          An unexpected error occurred while rendering this page. Our team has been notified.
        </p>

        <div className="pt-8 space-y-3">
          <Button 
            onClick={reset}
            className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-sm tracking-widest uppercase"
          >
            Try Again
          </Button>
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full h-14 rounded-none border-gray-200 text-foreground hover:bg-gray-50 text-sm tracking-widest uppercase">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
