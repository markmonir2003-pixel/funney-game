"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flag, Skull, Zap, Smile, Rocket, Cloud } from "lucide-react";

interface MazeProgressProps {
  currentStep: number;
  totalSteps: number;
  score: number;
  incorrectCount: number;
  selectedSkin?: string;
}

export function MazeProgress({ currentStep, totalSteps, score, incorrectCount, selectedSkin = "default" }: MazeProgressProps) {
  const isDanger = incorrectCount > totalSteps / 3;
  const progress = (currentStep / (totalSteps + 1)) * 100;
  
  // Villain position calculation
  const villainProgress = Math.max(0, (currentStep - 2 + (incorrectCount * 0.8)) / (totalSteps + 1) * 100);

  const getSkinIcon = () => {
    switch(selectedSkin) {
      case "ninja": return "🥷";
      case "robot": return "🤖";
      case "rocket": return "🚀";
      case "king": return "👑";
      default: return "😊";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 relative overflow-hidden bg-muted/30 rounded-[2rem] md:rounded-[3rem] border border-border backdrop-blur-sm">
      {/* Cartoon Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-10 left-10"
        >
          <Cloud className="w-20 h-20 text-primary/20" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, -80, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-10 right-20"
        >
          <Cloud className="w-16 h-16 text-primary/20" />
        </motion.div>
      </div>

      <div className="relative h-32 flex items-center pt-8">
        {/* The Game Track */}
        <div className="absolute inset-x-12 h-6 bg-slate-800/50 rounded-full overflow-hidden border-4 border-slate-900 shadow-inner">
           <motion.div 
             className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>

        {/* The Track Path Nodes */}
        <div className="absolute inset-x-12 flex justify-between">
          {[...Array(totalSteps + 2)].map((_, i) => (
            <div key={i} className="relative">
               <div className={`w-4 h-4 rounded-full border-2 ${i <= currentStep ? 'bg-yellow-400 border-yellow-200' : 'bg-slate-700 border-slate-800'}`} />
               {i === totalSteps + 1 && (
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <Flag className={`w-8 h-8 ${currentStep >= totalSteps ? 'text-green-400 animate-bounce' : 'text-slate-600'}`} />
                 </div>
               )}
            </div>
          ))}
        </div>

        {/* Chasing Monster (Cartoon Style) */}
        <motion.div
          className="absolute z-20"
          animate={{ left: `${12 + (villainProgress * 0.76)}%` }}
          transition={{ type: "spring", damping: 12 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1], y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="relative"
          >
            <div className="w-16 h-16 bg-red-500 rounded-2xl border-4 border-red-700 shadow-lg flex items-center justify-center relative">
               <Skull className="w-10 h-10 text-white" />
               {/* Monster Eyes */}
               <div className="absolute -top-2 left-2 w-4 h-4 bg-white rounded-full border-2 border-red-900" />
               <div className="absolute -top-2 right-2 w-4 h-4 bg-white rounded-full border-2 border-red-900" />
            </div>
            <div className="mt-2 bg-red-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md text-center">
              GRRR! 😈
            </div>
          </motion.div>
        </motion.div>

        {/* Student Hero (Cartoon Style) */}
        <motion.div
          className="absolute z-30"
          animate={{ left: `${12 + (progress * 0.76)}%` }}
          transition={{ type: "spring", damping: 10, stiffness: 80 }}
        >
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="relative"
          >
            <div className="w-16 h-16 bg-cyan-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
               <div className="bg-yellow-300 w-full h-1/2 absolute bottom-0" />
               <span className="text-3xl relative z-10">{getSkinIcon()}</span>
            </div>
            {/* Cape */}
            <motion.div 
              animate={{ rotate: [0, -20, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="absolute -left-4 top-4 w-8 h-10 bg-red-500 rounded-bl-3xl -z-10 border-2 border-red-700" 
            />
            <div className="mt-2 bg-cyan-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full text-center shadow-lg">
               {isDanger ? "HELP! 🏃‍♂️" : "HERO! ✨"}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Stats Bubble */}
      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 md:gap-8">
        <div className="flex items-center gap-3 bg-muted/50 px-6 py-3 rounded-2xl border border-border shadow-sm">
          <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-black text-foreground">{score} <span className="text-muted-foreground text-xs uppercase tracking-widest ml-1">Correct</span></span>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 px-6 py-3 rounded-2xl border border-border shadow-sm">
          <Rocket className="w-5 h-5 text-cyan-500" />
          <span className="font-black text-foreground">{totalSteps - currentStep} <span className="text-muted-foreground text-xs uppercase tracking-widest ml-1">Remaining</span></span>
        </div>
      </div>
    </div>
  );
}
