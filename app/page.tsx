import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Play, Sparkles, Trophy, BookOpen, LayoutDashboard } from "lucide-react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { TutorialButton } from "@/components/TutorialButton";
import { SyncWrapper } from "@/components/SyncWrapper";

export default function Home() {
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
      <SyncWrapper />
      <BackgroundEffects />

      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full text-center space-y-16">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-cyan-400 font-bold text-sm tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>تعلُّم تفاعلي بأسلوب جديد</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-foreground leading-none">
              Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">2</span> Learn
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
              حيث ينشئ المعلمون التحديات ويتنافس الطلاب على صدارة لوحة المتصدرين.
            </p>
          </div>

          {/* Tutorial Button (Client Component) */}
          <TutorialButton />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {/* Student Card */}
          <div className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-cyan-500/50 transition-all duration-500 shadow-xl">
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
          </div>

          {/* Teacher Card */}
          <div className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-purple-500/50 transition-all duration-500 shadow-xl">
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
          </div>

          {/* Study Hub Card */}
          <div className="group relative p-8 rounded-[2.5rem] bg-card border border-border hover:border-emerald-500/50 transition-all duration-500 shadow-xl">
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
          </div>
        </div>

        {/* Footer/Trust */}
        <div className="pt-8 flex flex-col items-center gap-6">
          <div className="h-px w-24 bg-border" />
          <p className="text-muted-foreground font-medium tracking-tight">
            مثالية للفصول الدراسية التفاعلية والتعلم الممتع
          </p>
          <div className="flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-500 rounded-full" />
                <span className="text-foreground font-bold">تعليم ممتع</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 rotate-45" />
                <span className="text-foreground font-bold">تحدي المعرفة</span>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
