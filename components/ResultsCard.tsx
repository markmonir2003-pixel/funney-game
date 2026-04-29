"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStarRating, getMotivationalMessage } from "@/lib/gameLogic";
import { Trophy, RefreshCcw, Home, Star, Zap, Skull, Award, ScrollText } from "lucide-react";
import { checkAchievements } from "@/lib/storage";
import { useSound } from "@/hooks/useSound";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

const CertificateModal = dynamic(() => import("./CertificateModal").then(mod => mod.CertificateModal), {
  ssr: false,
});

interface ResultsCardProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  lesson: string;
  onRetry: () => void;
  onBackToLessons: () => void;
}

export function ResultsCard({
  score,
  totalQuestions,
  xpEarned,
  lesson,
  onRetry,
  onBackToLessons,
}: ResultsCardProps) {
  const { play } = useSound();
  const accuracy = Math.round((score / totalQuestions) * 100);
  const isPassing = accuracy >= 70;
  const isDefeated = accuracy < 50; 
  const stars = getStarRating(accuracy);
  const message = isDefeated ? "لقد أمسك بك الوحش! لا تدعه يفوز في المرة القادمة!" : getMotivationalMessage(accuracy);
  
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const { user } = useUser();
  
  const studentName = user?.fullName || user?.username || "بطل البرمجة";
  const today = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!isDefeated) {
      play("win");
      const unlocked = checkAchievements();
      setNewAchievements(unlocked);
    } else {
      play("wrong");
    }
  }, [isDefeated, play]);

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      <div className={`bg-card/90 backdrop-blur-2xl border ${isDefeated ? 'border-red-500/50' : 'border-border'} rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-64 sm:h-64 blur-[80px] sm:blur-[100px] pointer-events-none opacity-20 ${isDefeated ? 'bg-red-600' : isPassing ? 'bg-green-500' : 'bg-orange-500'}`} />

        {/* Celebration/Defeat Icon */}
        <motion.div
          className="relative z-10 mb-6 sm:mb-8 inline-flex items-center justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] ${isDefeated ? 'bg-red-500/20' : isPassing ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
            {isDefeated ? <Skull className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" /> : <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-green-400" />}
          </div>
          {isPassing && (
             <motion.div 
               className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 text-2xl sm:text-4xl"
               animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               ✨
             </motion.div>
          )}
        </motion.div>

        {/* Stats Section */}
        <div className="relative z-10 space-y-1 sm:space-y-2 mb-6 sm:mb-10">
          <h2 className={`text-2xl sm:text-4xl font-black tracking-tight leading-tight ${isDefeated ? 'text-red-500' : 'text-foreground'}`}>
            {isDefeated ? "لقد هزمت!" : isPassing ? "تمت المهمة بنجاح!" : "اكتمل التحدي!"}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg font-medium">{lesson}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-10">
           <div className={`bg-muted/50 border ${isDefeated ? 'border-red-500/30' : 'border-border'} rounded-2xl sm:rounded-3xl p-4 sm:p-6`}>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">الدقة</p>
              <p className={`text-2xl sm:text-4xl font-black ${isDefeated ? 'text-red-400' : 'text-foreground'}`}>{accuracy}%</p>
           </div>
           <div className={`bg-cyan-500/10 border border-cyan-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6`}>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-cyan-500 mb-1">النقاط</p>
              <p className="text-2xl sm:text-4xl font-black text-cyan-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 fill-cyan-400" />
                {xpEarned}
              </p>
           </div>
        </div>

        {/* New Achievement Section */}
        <AnimatePresence>
          {newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-6 sm:mb-10 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 justify-center"
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="text-yellow-600 text-xs sm:text-sm font-bold">إنجاز جديد: {newAchievements[0]}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stars */}
        {!isDefeated && (
          <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: i < stars ? 1 : 0.4, rotate: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
              >
                <Star className={`w-8 h-8 sm:w-12 sm:h-12 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Message */}
        <p className={`text-base sm:text-xl font-bold mb-8 sm:mb-12 italic px-2 ${isDefeated ? 'text-red-400' : 'text-muted-foreground'}`}>
          "{message}"
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:gap-4 relative z-10">
          {isPassing && (
             <Button
               onClick={() => setShowCertificate(true)}
               className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black text-lg sm:text-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] border-none"
             >
               <Award className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
               استلام شهادة التقدير ✨
             </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={onRetry}
              variant="outline"
              className={`flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-border hover:bg-muted text-foreground font-black text-sm sm:text-lg transition-all ${isDefeated ? 'hover:bg-red-500/10 border-red-500/20' : ''}`}
            >
              <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              حاول مرة أخرى
            </Button>
            <Button
              onClick={onBackToLessons}
              className={`flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r ${isDefeated ? 'from-red-600 to-red-800 shadow-red-500/20' : 'from-cyan-500 to-blue-600 shadow-cyan-500/20'} hover:opacity-90 text-white font-black text-sm sm:text-lg shadow-xl transition-all`}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              العودة للساحة
            </Button>
          </div>
        </div>
      </div>

      <CertificateModal 
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        studentName={studentName}
        lessonName={lesson}
        score={accuracy}
        date={today}
      />
    </motion.div>
  );
}
