"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LessonCard } from "@/components/LessonCard";
import { LESSONS } from "@/lib/gameLogic";
import { getTeacherData, CustomLesson } from "@/lib/teacherStorage";
import {
  getCompletedLessons,
  getLessonBestScore,
  getTotalXP,
} from "@/lib/storage";
import { Sparkles, Trophy, BookOpen, ShoppingBag, LayoutDashboard, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import dynamic from "next/dynamic";

const Leaderboard = dynamic(() => import("@/components/Leaderboard").then(mod => mod.Leaderboard), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-card rounded-[2.5rem]" />
});

export default function LessonsPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [lessonStats, setLessonStats] = useState<
    Record<string, { bestScore: number; attempts: number }>
  >({});

  useEffect(() => {
    const completed = getCompletedLessons();
    const teacherLessons = getTeacherData();
    setCompletedLessons(completed);
    setTotalXP(getTotalXP());
    setCustomLessons(teacherLessons);

    const stats: Record<string, { bestScore: number; attempts: number }> = {};
    
    // Combine default and custom lesson names for stats
    const allLessonNames = [...LESSONS, ...teacherLessons.map(l => l.name)];
    
    allLessonNames.forEach((lesson) => {
      const bestScore = getLessonBestScore(lesson);
      stats[lesson] = {
        bestScore,
        attempts: bestScore > 0 ? 1 : 0,
      };
    });
    setLessonStats(stats);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:py-12 selection:bg-cyan-500/30 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              className="mb-8 md:mb-12 space-y-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-500 font-bold tracking-widest uppercase text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>ساحة الطالب</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
                    اختر <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">مهمتك</span>
                  </h1>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-xl font-medium">
                    جاهز لرفع مستواك؟ اختر درساً وابدأ بكسب النقاط!
                  </p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                   <Link href="/shop" className="flex-1 md:flex-none">
                    <Button
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 font-black"
                    >
                      <ShoppingBag className="w-5 h-5 ml-2" />
                      متجر الأبطال
                    </Button>
                  </Link>
                  <Link href="/" className="flex-1 md:flex-none">
                    <Button
                      variant="outline"
                      className="group border-border hover:bg-muted text-foreground rounded-xl px-6 h-12 transition-all w-full"
                    >
                      الرئيسية
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats bar */}
               <div className="grid grid-cols-2 gap-4 bg-card backdrop-blur-xl border border-border rounded-[2rem] p-4 md:p-6 shadow-sm">
                <div className="flex items-center gap-3 md:gap-4 px-2 md:px-4">
                  <div className="p-2 md:p-3 bg-cyan-500/10 rounded-xl md:rounded-2xl shrink-0">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">إجمالي النقاط</p>
                    <p className="text-lg md:text-2xl font-black text-foreground leading-none">{totalXP} <span className="text-cyan-600 text-[10px] md:text-sm">نقطة</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 px-2 md:px-4 border-r border-border">
                  <div className="p-2 md:p-3 bg-green-500/10 rounded-xl md:rounded-2xl shrink-0">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">المتقنة</p>
                    <p className="text-lg md:text-2xl font-black text-foreground leading-none">
                      {completedLessons.length} <span className="text-muted-foreground text-[10px] md:text-sm">/ {LESSONS.length + customLessons.length}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

        {/* Custom Lessons Section (Teacher created) */}
        {customLessons.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full" />
              دروس المعلم الخاصة
            </h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {customLessons.map((lesson) => (
                <motion.div key={lesson.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <LessonCard
                    name={lesson.name}
                    isCompleted={completedLessons.includes(lesson.name)}
                    bestScore={lessonStats[lesson.name]?.bestScore || 0}
                    attempts={lessonStats[lesson.name]?.attempts || 0}
                    isCustom
                    color={lesson.color}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Default Lessons Section */}
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-cyan-500 rounded-full" />
          المهمات القياسية
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {LESSONS.map((lesson) => (
            <motion.div key={lesson} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <LessonCard
                name={lesson}
                isCompleted={completedLessons.includes(lesson)}
                bestScore={lessonStats[lesson]?.bestScore || 0}
                attempts={lessonStats[lesson]?.attempts || 0}
              />
            </motion.div>
          ))}
        </motion.div>

        </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-8">
            <Leaderboard />

            {/* External Study Hub Integration */}
            <div className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group hover:border-primary/50 transition-all text-right">
               <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                     <LayoutDashboard className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-black">مركز المذاكرة</h3>
               </div>
               <p className="text-muted-foreground font-medium text-sm mb-6 leading-relaxed">
                  نظّم مهامك اليومية، دوّن ملاحظات ذكية، واستخدم مؤقت التركيز لتبقى في المقدمة!
               </p>
               <a href="https://studey-smarter-hhw5.vercel.app/" target="_blank" rel="noopener noreferrer">
                 <Button className="w-full h-14 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/20">
                    افتح لوحة التحكم <ChevronRight className="w-5 h-5 mr-2 rotate-180" />
                 </Button>
               </a>
            </div>
            
            {/* Quick Tip Card */}
            <div className="bg-card border-2 border-border rounded-[2.5rem] p-8 text-foreground shadow-xl relative overflow-hidden group text-right">
               <div className="absolute top-0 left-0 p-4 opacity-10 text-yellow-500 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-16 h-16" />
               </div>
               <h3 className="text-xl font-black mb-2 relative z-10">نصيحة للمحترفين!</h3>
               <p className="text-muted-foreground font-medium text-sm relative z-10 leading-relaxed">
                  حقق سلسلة 5 إجابات متتالية لمضاعفة نقاطك في الـ 3 أسئلة القادمة!
               </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
