"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function Error({
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-card border border-border rounded-[2.5rem] p-12 shadow-2xl">
        <div className="flex justify-center">
          <div className="p-6 bg-red-500/10 rounded-full">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-foreground tracking-tight">عذراً، حدث خطأ ما!</h1>
          <p className="text-muted-foreground font-medium">
            يبدو أن هناك مشكلة تقنية صغيرة. لا تقلق، فريق Play 2 Learn يعمل على إصلاحها.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={() => reset()}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-lg gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            حاول مرة أخرى
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-14 rounded-2xl border-border hover:bg-muted font-black text-lg gap-2"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
