"use client";

import Link from "next/link";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { LogIn, Sparkles } from "lucide-react";

export function Header() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tight hidden sm:block">
            Play <span className="text-primary">2</span> Learn
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {isLoaded && (
            <>
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <Button variant="outline" className="rounded-xl border-border hover:bg-muted font-bold h-10 px-4">
                    <LogIn className="w-4 h-4 ml-2" /> تسجيل الدخول
                  </Button>
                </SignInButton>
              ) : (
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 rounded-xl border-2 border-primary/20",
                      userButtonTrigger: "focus:shadow-none focus:ring-0"
                    }
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
