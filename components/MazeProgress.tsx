"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flag, Skull, Zap, Smile, Rocket, Cloud } from "lucide-react";
import { memo } from "react";
import { SKINS } from "@/lib/gameLogic";

interface MazeProgressProps {
   currentStep: number;
   totalSteps: number;
   score: number;
   incorrectCount: number;
   selectedSkin?: string;
   isFinished?: boolean;
   didWin?: boolean;
   status?: "idle" | "happy" | "sad";
   userImage?: string;
 }

export const MazeProgress = memo(function MazeProgress({ 
  currentStep, 
  totalSteps, 
  score, 
   incorrectCount, 
   selectedSkin = "default",
   isFinished = false,
   didWin = true,
   status = "idle",
   userImage
 }: MazeProgressProps) {
   const isDanger = incorrectCount > totalSteps / 3;
   const progress = isFinished && didWin ? 100 : (score / totalSteps) * 100;
   
   // Villain only moves when student makes a mistake. 
   // Reaches end if student makes 75% mistakes (less punishing)
   const villainProgress = isFinished && !didWin ? 100 : (incorrectCount / (totalSteps * 0.75)) * 100;
 
   const getSkinIcon = () => {
     if (status === "happy") return "🤩";
     if (status === "sad") return "😢";
     
     return SKINS.find(s => s.id === selectedSkin)?.emoji || "😊";
   };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-12 relative overflow-hidden bg-card/80 rounded-[2rem] md:rounded-[3.5rem] border border-border shadow-2xl backdrop-blur-md">
      {/* Cartoon Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-5 md:top-10 left-5 md:left-10"
        >
          <Cloud className="w-12 h-12 md:w-20 md:h-20 text-primary/20" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, -80, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-5 md:bottom-10 right-10 md:right-20"
        >
          <Cloud className="w-10 h-10 md:w-16 md:h-16 text-primary/20" />
        </motion.div>
      </div>

      <div className="relative h-32 md:h-48 flex items-center justify-center">
        {/* The Game Track - Professional Road Design */}
        <div className="absolute inset-x-8 md:inset-x-12 h-10 md:h-16 bg-slate-800 rounded-2xl md:rounded-3xl overflow-hidden border-b-[6px] md:border-b-[12px] border-slate-900 shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
           {/* Road Markings */}
           <div className="absolute inset-0 flex items-center justify-around opacity-30">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-8 md:w-16 h-1 md:h-2 bg-white/40 rounded-full" />
              ))}
           </div>
           {/* Progress Path */}
           <motion.div 
             className="h-full bg-gradient-to-l from-yellow-400 via-orange-500 to-red-500 opacity-30"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.5 }}
           />
        </div>

        {/* The Track Path Nodes */}
        <div className="absolute inset-x-8 md:inset-x-12 flex justify-between px-4 md:px-6">
          {[...Array(totalSteps + 1)].map((_, i) => (
            <div key={i} className="relative">
               <div className={`w-3 h-3 md:w-5 md:h-5 rounded-full border md:border-2 shadow-inner transition-colors duration-500 ${i <= currentStep ? 'bg-yellow-400 border-yellow-200 shadow-yellow-500/50' : 'bg-slate-700 border-slate-800'}`} />
               {i === totalSteps && (
                 <div className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2">
                    <Flag className={`w-8 h-8 md:w-12 md:h-12 ${currentStep >= totalSteps ? 'text-green-400 animate-bounce drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'text-slate-600'}`} />
                 </div>
               )}
            </div>
          ))}
        </div>

        {/* Chasing Monster (Cartoon Style) */}
        <motion.div
          className="absolute z-20 mb-14 md:mb-20"
          animate={{ right: `calc(${typeof window !== 'undefined' && window.innerWidth < 768 ? '1.75rem' : '2.5rem'} + ${Math.min(100, villainProgress) * 0.01} * (100% - ${typeof window !== 'undefined' && window.innerWidth < 768 ? '6rem' : '9rem'}))` }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="relative"
          >
            <div className="w-10 h-10 md:w-16 md:h-16 bg-red-600 rounded-xl md:rounded-2xl border-2 md:border-4 border-red-800 shadow-2xl flex items-center justify-center relative">
               <Skull className="w-6 h-6 md:w-10 md:h-10 text-white drop-shadow-lg" />
               <div className="absolute -top-1 -left-1 w-3 h-3 md:w-5 md:h-5 bg-red-900 rounded-full blur-[2px] opacity-50" />
            </div>
            <div className="mt-1 md:mt-2 bg-red-950 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-md text-center shadow-lg border border-red-800">
              سأهزمك! 😈
            </div>
          </motion.div>
        </motion.div>

        {/* Student Hero (Cartoon Style) */}
        <motion.div
          className="absolute z-30 mb-14 md:mb-20"
          animate={{ 
            right: `calc(${typeof window !== 'undefined' && window.innerWidth < 768 ? '1.75rem' : '2.5rem'} + ${Math.min(100, progress) * 0.01} * (100% - ${typeof window !== 'undefined' && window.innerWidth < 768 ? '6rem' : '9rem'}))`,
            y: status === "happy" ? -20 : 0
          }}
          transition={{ type: "spring", damping: 12, stiffness: 90 }}
        >
          <motion.div 
            animate={{ 
              y: status === "happy" ? [0, -10, 0] : [0, -5, 0],
              rotate: status === "happy" ? [0, 10, -10, 0] : [-2, 2, -2]
            }}
            transition={{ duration: status === "happy" ? 0.3 : 0.5, repeat: status === "happy" ? 3 : Infinity }}
            className="relative"
          >
            <div className={`w-10 h-10 md:w-16 md:h-16 rounded-full border-2 md:border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-colors ${status === 'happy' ? 'bg-yellow-400' : status === 'sad' ? 'bg-red-400' : 'bg-cyan-400'}`}>
               {userImage ? (
                 <img src={userImage} alt="Player" className="w-full h-full object-cover" />
               ) : (
                 <>
                   <div className={`${status === 'happy' ? 'bg-yellow-500' : status === 'sad' ? 'bg-red-500' : 'bg-yellow-300'} w-full h-1/2 absolute bottom-0`} />
                   <span className={`text-2xl md:text-4xl relative z-10 transition-transform ${status === 'happy' ? 'scale-125' : 'scale-x-[-1]'}`}>{getSkinIcon()}</span>
                 </>
               )}
            </div>
            {/* Cape */}
            <motion.div 
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="absolute -right-2 md:-right-4 top-2 md:top-4 w-5 md:w-8 h-6 md:h-10 bg-red-500 rounded-br-2xl md:rounded-br-3xl -z-10 border md:border-2 border-red-700" 
            />
            <div className="mt-1 md:mt-2 bg-cyan-600 text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-full text-center shadow-lg whitespace-nowrap">
               {isDanger ? "أسرع! 🏃‍♂️" : "سابق الريح! ✨"}
            </div>
            {/* Speed Lines */}
            <motion.div 
               className="absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 flex gap-1 opacity-40"
               animate={{ x: [0, 5, 0] }}
               transition={{ duration: 0.2, repeat: Infinity }}
            >
               <div className="w-2 md:w-4 h-0.5 md:h-1 bg-white rounded-full" />
               <div className="w-1 md:w-2 h-0.5 md:h-1 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress Stats Bubble */}
      <div className="mt-6 md:mt-12 flex flex-row justify-center gap-2 md:gap-8">
        <div className="flex items-center gap-2 md:gap-3 bg-muted/50 px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-border shadow-sm">
          <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-black text-foreground text-xs md:text-base">{score} <span className="text-muted-foreground text-[8px] md:text-xs uppercase tracking-tighter md:tracking-widest ml-1">إجابة صحيحة</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-3 bg-muted/50 px-3 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-border shadow-sm">
          <Rocket className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />
          <span className="font-black text-foreground text-xs md:text-base">{totalSteps - currentStep} <span className="text-muted-foreground text-[8px] md:text-xs uppercase tracking-tighter md:tracking-widest ml-1">سؤال متبقي</span></span>
        </div>
      </div>
    </div>
  );
});
