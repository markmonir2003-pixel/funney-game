"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, Sparkles, Trophy, BookOpen, Star, LayoutDashboard, LogIn, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { TutorialModal } from "@/components/TutorialModal";

export default function Home() {
  useSyncProgress(); // Trigger cloud fetch on mount if signed in
  const [showTutorial, setShowTutorial] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const generatedStars = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
    setStars(generatedStars);
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden selection:bg-cyan-500/30">
      {/* Tutorial Modal */}
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"
          animate={{
            x: [0, -50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Floating Stars */}
        {mounted && stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-500/20"
            initial={{ 
              top: star.top, 
              left: star.left,
              scale: star.scale
            }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: star.duration, 
              repeat: Infinity,
              delay: star.delay
            }}
          >
            <Star className="w-2 h-2 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-5xl w-full text-center space-y-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 font-bold text-sm tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4" />
            <span>تعلُّم تفاعلي بأسلوب جديد</span>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-none">
              Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">2</span> Learn
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              حيث ينشئ المعلمون التحديات ويتنافس الطلاب على صدارة لوحة المتصدرين.
            </p>
          </motion.div>

          {/* Tutorial Button */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => setShowTutorial(true)}
              className="rounded-full px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 font-black text-lg transition-all hover:scale-105"
            >
              <HelpCircle className="w-5 h-5 ml-2" />
              كيف تلعب؟ 🎮
            </Button>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {/* Student Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-cyan-500/50 transition-all duration-500 shadow-xl"
          >
            <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Play className="w-32 h-32 text-cyan-500" />
            </div>
            <div className="relative z-10 text-right space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">ساحة الطالب</h3>
                <p className="text-muted-foreground text-sm">العب الدروس، اكسب نقاط الخبرة، وكن بطل الفصل!</p>
              </div>
              <Link href="/lessons" className="block">
                <Button className="w-full h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-black text-lg shadow-xl shadow-cyan-500/20 transition-all group-hover:scale-[1.02]">
                  ابدأ اللعب
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Teacher Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-purple-500/50 transition-all duration-500 shadow-xl"
          >
            <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap className="w-32 h-32 text-purple-500" />
            </div>
            <div className="relative z-10 text-right space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">بوابة المعلم</h3>
                <p className="text-muted-foreground text-sm">أنشئ دروساً وأسئلة مخصصة لطلابك.</p>
              </div>
              <Link href="/teacher" className="block">
                <Button className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-500/20 transition-all group-hover:scale-[1.02]">
                  إدارة الدروس
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Study Hub Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-emerald-500/50 transition-all duration-500 shadow-xl"
          >
            <div className="absolute top-0 left-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutDashboard className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10 text-right space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">مركز المذاكرة</h3>
                <p className="text-muted-foreground text-sm">نظّم مهامك، ملاحظاتك، وركّز بأدواتنا الاحترافية.</p>
              </div>
              <a href="https://studey-smarter-hhw5.vercel.app/" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-500/20 transition-all group-hover:scale-[1.02]">
                  افتح لوحة التحكم
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Footer/Trust */}
        <motion.div variants={itemVariants} className="pt-8 flex flex-col items-center gap-6">
          <div className="h-px w-24 bg-slate-800" />
          <p className="text-slate-500 font-medium tracking-tight">
            مثالية للفصول الدراسية التفاعلية والتعلم الممتع
          </p>
          <div className="flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
             {/* Simple shapes to act as logo placeholders */}
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-500 rounded-full" />
                <span className="text-white font-bold">تعليم ممتع</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 rotate-45" />
                <span className="text-white font-bold">تحدي المعرفة</span>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
