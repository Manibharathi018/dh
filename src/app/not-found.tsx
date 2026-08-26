"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-8xl font-heading font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-heading font-medium uppercase tracking-widest text-foreground mb-6">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 text-sm">
          We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps the URL was misspelled.
        </p>
        <Link href="/">
          <Button className="rounded-none bg-foreground text-background hover:bg-foreground/90 uppercase tracking-[0.15em] text-xs h-12 px-8">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
