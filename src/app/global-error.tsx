"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
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
    <html>
      <body className="bg-white min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 px-6">
          <h1 className="text-4xl font-heading font-medium">Critical Error</h1>
          <p className="text-muted-foreground leading-relaxed">
            A critical error crashed the application framework.
          </p>
          <Button 
            onClick={reset}
            className="w-full h-14 rounded-none bg-black text-white hover:bg-black/90 text-sm tracking-widest uppercase"
          >
            Reset Application
          </Button>
        </div>
      </body>
    </html>
  );
}
