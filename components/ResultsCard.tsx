"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getStarRating, getMotivationalMessage } from "@/lib/gameLogic";
import { Trophy, RefreshCcw, Home, Star, Zap, Skull, Award, ScrollText } from "lucide-react";
import { checkAchievements } from "@/lib/storage";
import { useSound } from "@/hooks/useSound";
import { CertificateModal } from "./CertificateModal";
import { useUser } from "@clerk/nextjs";

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
      <div className={`bg-[#0f172a]/80 backdrop-blur-2xl border ${isDefeated ? 'border-red-500/50' : 'border-white/10'} rounded-[3rem] p-10 text-center shadow-2xl relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] pointer-events-none opacity-20 ${isDefeated ? 'bg-red-600' : isPassing ? 'bg-green-500' : 'bg-orange-500'}`} />

        {/* Celebration/Defeat Icon */}
        <motion.div
          className="relative z-10 mb-8 inline-flex items-center justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`p-6 rounded-[2rem] ${isDefeated ? 'bg-red-500/20' : isPassing ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
            {isDefeated ? <Skull className="w-16 h-16 text-red-500" /> : <Trophy className="w-16 h-16 text-green-400" />}
          </div>
          {isPassing && (
             <motion.div 
               className="absolute -top-4 -right-4 text-4xl"
               animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
               ✨
             </motion.div>
          )}
        </motion.div>

        {/* Stats Section */}
        <div className="relative z-10 space-y-2 mb-10">
          <h2 className={`text-4xl font-black tracking-tight leading-tight ${isDefeated ? 'text-red-500' : 'text-white'}`}>
            {isDefeated ? "لقد هزمت!" : isPassing ? "تمت المهمة بنجاح!" : "اكتمل التحدي!"}
          </h2>
          <p className="text-slate-400 text-lg font-medium">{lesson}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className={`bg-white/5 border ${isDefeated ? 'border-red-500/30' : 'border-white/10'} rounded-3xl p-6`}>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">الدقة</p>
              <p className={`text-4xl font-black ${isDefeated ? 'text-red-400' : 'text-white'}`}>{accuracy}%</p>
           </div>
           <div className={`bg-cyan-500/10 border border-cyan-500/20 rounded-3xl p-6`}>
              <p className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-1">النقاط المكتسبة</p>
              <p className="text-4xl font-black text-cyan-400 flex items-center justify-center gap-1">
                <Zap className="w-6 h-6 fill-cyan-400" />
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
              className="mb-10 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-3 justify-center"
            >
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-600 font-bold">إنجاز جديد: {newAchievements[0]}!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stars */}
        {!isDefeated && (
          <div className="flex justify-center gap-4 mb-10">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: i < stars ? 1 : 0.4, rotate: 0 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
              >
                <Star className={`w-12 h-12 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Message */}
        <p className={`text-xl font-bold mb-12 italic ${isDefeated ? 'text-red-400' : 'text-slate-200'}`}>
          "{message}"
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-4 relative z-10">
          {isPassing && (
             <Button
               onClick={() => setShowCertificate(true)}
               className="w-full h-16 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-black text-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02] border-none"
             >
               <ScrollText className="w-6 h-6 ml-2" />
               استلام شهادة التقدير ✨
             </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={onRetry}
              variant="outline"
              className={`flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 text-white font-black text-lg transition-all ${isDefeated ? 'hover:bg-red-500/10 border-red-500/20' : ''}`}
            >
              <RefreshCcw className="w-5 h-5 ml-2" />
              حاول مرة أخرى
            </Button>
            <Button
              onClick={onBackToLessons}
              className={`flex-1 h-14 rounded-2xl bg-gradient-to-r ${isDefeated ? 'from-red-600 to-red-800 shadow-red-500/20' : 'from-cyan-500 to-blue-600 shadow-cyan-500/20'} hover:opacity-90 text-white font-black text-lg shadow-xl transition-all`}
            >
              <Home className="w-5 h-5 ml-2" />
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
