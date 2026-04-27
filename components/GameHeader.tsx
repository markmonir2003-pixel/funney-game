"use client";

import { motion } from "framer-motion";
import { Zap, Flame, Clock, Target, LogIn } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";

interface GameHeaderProps {
  xp: number;
  comboStreak: number;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number;
}

export function GameHeader({
  xp,
  comboStreak,
  currentQuestion,
  totalQuestions,
  timeRemaining,
}: GameHeaderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const progress = (currentQuestion / totalQuestions) * 100;
  const isTimerWarning = timeRemaining <= 10;

  return (
    <div className="w-full bg-background/80 border-b border-border backdrop-blur-2xl px-4 md:px-6 py-4 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        {/* Top Row: Info Chips */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-3">
             {/* XP Badge */}
            <motion.div
              className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl px-3 md:px-4 py-2"
              animate={{ scale: xp > 0 ? [1, 1.05, 1] : 1 }}
            >
              <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500" />
              <span className="text-sm md:text-lg font-black text-foreground">{xp} <span className="text-cyan-600 text-[10px] md:text-xs uppercase tracking-widest ml-1">XP</span></span>
            </motion.div>

            {/* Combo Badge */}
            {comboStreak > 1 && (
              <motion.div
                className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-3 md:px-4 py-2"
                initial={{ scale: 0, x: -20 }}
                animate={{ scale: 1, x: 0 }}
              >
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span className="text-sm md:text-lg font-black text-foreground">{comboStreak} <span className="text-orange-500 text-[10px] md:text-xs uppercase tracking-widest ml-1">Combo</span></span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            
            {isLoaded && (
              <>
                {!isSignedIn ? (
                  <SignInButton mode="modal">
                    <Button variant="outline" className="rounded-xl border-border hover:bg-muted font-bold h-10 px-4">
                      <LogIn className="w-4 h-4 mr-2" /> Sign In
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

            {/* Timer */}
            <motion.div
              className={`flex items-center gap-2 rounded-2xl px-3 md:px-4 py-2 font-black text-base md:text-lg border-2 ${
                isTimerWarning
                  ? "bg-red-500/10 border-red-500/50 text-red-500"
                  : "bg-muted/50 border-border text-foreground"
              }`}
              animate={isTimerWarning ? { scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] } : {}}
              transition={{ duration: 0.5, repeat: isTimerWarning ? Infinity : 0 }}
            >
              <Clock className={`w-4 h-4 md:w-5 h-5 ${isTimerWarning ? 'text-red-500' : 'text-cyan-500'}`} />
              <span className="tabular-nums">{timeRemaining}s</span>
            </motion.div>
          </div>
        </div>

        {/* Bottom Row: Animated Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden border border-border">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
