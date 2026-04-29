"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Zap, 
  ShoppingBag, 
  ChevronLeft, 
  Check, 
  Lock, 
  User, 
  Gamepad2, 
  ShieldCheck, 
  Timer, 
  FastForward,
  Award,
  Sparkles
} from "lucide-react";
import { 
  getStorageData, 
  unlockSkin, 
  selectSkin, 
  addPowerup,
  getAchievements,
  checkAchievements,
  saveStorageData
} from "@/lib/storage";
import { SKINS } from "@/lib/gameLogic";

const ACHIEVEMENT_LIST = [
  { id: "newbie", name: "الخطوات الأولى", desc: "اكسب 100 نقطة", icon: "🌱" },
  { id: "expert", name: "خبير الكود", desc: "صل للمستوى 5", icon: "🧠" },
  { id: "legend", name: "أسطورة مطلقة", desc: "اكسب 10,000 نقطة", icon: "👑" },
  { id: "streak_5", name: "متوهج!", desc: "احصل على دقة 100%", icon: "🔥" },
  { id: "dedicated", name: "طالب مجتهد", desc: "أكمل 10 مهمات", icon: "📚" },
];

const POWERUPS = [
  { id: "freeze", name: "تجميد الوقت", icon: Timer, cost: 200, desc: "إيقاف المؤقت لـ 5 ثوانٍ" },
  { id: "shield", name: "درع الوحش", icon: ShieldCheck, cost: 500, desc: "حماية من خطأ واحد" },
  { id: "skip", name: "تخطي سريع", icon: FastForward, cost: 800, desc: "تخطي سؤال واحد" },
];

export default function ShopPage() {
  const [xp, setXp] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);
  const [selectedSkin, setSelectedSkin] = useState("default");
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"skins" | "powerups" | "achievements">("skins");

  useEffect(() => {
    checkAchievements();
    const data = getStorageData();
    setXp(data.gameProgress.totalXP);
    setUnlockedSkins(data.gameProgress.unlockedSkins);
    setSelectedSkin(data.gameProgress.selectedSkin);
    setEarnedAchievements(data.gameProgress.achievements);
  }, []);

  const handleBuySkin = (skinId: string, cost: number) => {
    if (unlockSkin(skinId, cost)) {
      setXp(xp - cost);
      setUnlockedSkins([...unlockedSkins, skinId]);
    }
  };

  const handleSelectSkin = (skinId: string) => {
    selectSkin(skinId);
    setSelectedSkin(skinId);
  };

  const handleBuyPowerup = (id: string, cost: number) => {
     if (xp >= cost) {
        addPowerup(id as any, 1);
        const data = getStorageData();
        data.gameProgress.totalXP -= cost;
        saveStorageData(data);
        setXp(xp - cost);
        alert("تم الشراء بنجاح!");
     }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/lessons">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
               <div className="p-1.5 md:p-2 bg-primary/10 rounded-xl">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-primary" />
               </div>
               <h1 className="text-xl md:text-2xl font-black tracking-tight">متجر الأبطال</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-muted px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-border flex items-center gap-1.5 md:gap-2 shadow-inner">
               <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
               <span className="text-base md:text-lg font-black">{xp.toLocaleString()}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 p-1 bg-muted w-full md:w-fit rounded-2xl mb-8 md:mb-12 border border-border">
          <Button 
            variant={activeTab === "skins" ? "default" : "ghost"} 
            onClick={() => setActiveTab("skins")}
            className="rounded-xl px-2 md:px-8 h-12 font-bold text-xs md:text-base transition-all"
          >
            <User className="w-4 h-4 ml-1 md:ml-2" /> الشخصيات
          </Button>
          <Button 
            variant={activeTab === "powerups" ? "default" : "ghost"} 
            onClick={() => setActiveTab("powerups")}
            className="rounded-xl px-2 md:px-8 h-12 font-bold text-xs md:text-base transition-all"
          >
            <Gamepad2 className="w-4 h-4 ml-1 md:ml-2" /> القوى
          </Button>
          <Button 
            variant={activeTab === "achievements" ? "default" : "ghost"} 
            onClick={() => setActiveTab("achievements")}
            className="rounded-xl px-2 md:px-8 h-12 font-bold text-xs md:text-base transition-all"
          >
            <Award className="w-4 h-4 ml-1 md:ml-2" /> الأوسمة
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "skins" && (
            <motion.div key="skins" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {SKINS.map((skin) => (
                <div key={skin.id} className={`relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 transition-all duration-300 ${selectedSkin === skin.id ? 'bg-primary/5 border-primary shadow-2xl' : 'bg-card border-border shadow-sm'}`}>
                  {selectedSkin === skin.id && <div className="absolute -top-3 -left-3 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">مجهّز</div>}
                  <div className={`w-32 h-32 ${skin.color} rounded-full mx-auto mb-8 border-8 border-white/20 shadow-2xl flex items-center justify-center text-5xl`}>
                     {skin.emoji}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-center mb-6">{skin.name}</h3>
                  {!unlockedSkins.includes(skin.id) ? (
                    <Button onClick={() => handleBuySkin(skin.id, skin.cost)} disabled={xp < skin.cost} className="w-full h-12 md:h-14 rounded-2xl font-black text-base md:text-lg"><Lock className="w-4 h-4 md:w-5 md:h-5 ml-2" /> {skin.cost} نقطة</Button>
                  ) : (
                    <Button onClick={() => handleSelectSkin(skin.id)} disabled={selectedSkin === skin.id} variant={selectedSkin === skin.id ? "secondary" : "outline"} className="w-full h-12 md:h-14 rounded-2xl font-black text-base md:text-lg">{selectedSkin === skin.id ? "نشط" : "تجهيز"}</Button>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "powerups" && (
            <motion.div key="powerups" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {POWERUPS.map((pu) => (
                <div key={pu.id} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-primary/10 rounded-3xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform"><pu.icon className="w-12 h-12 text-primary" /></div>
                  <h3 className="text-2xl font-black mb-2">{pu.name}</h3>
                  <p className="text-muted-foreground mb-8 font-medium">{pu.desc}</p>
                  <Button onClick={() => handleBuyPowerup(pu.id, pu.cost)} disabled={xp < pu.cost} className="w-full h-14 rounded-2xl font-black text-lg mt-auto">شراء بـ {pu.cost} نقطة</Button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACHIEVEMENT_LIST.map((ach) => {
                const isEarned = earnedAchievements.includes(ach.id);
                return (
                  <div key={ach.id} className={`flex items-center gap-4 md:gap-6 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-2 transition-all ${isEarned ? 'bg-card border-yellow-500/50 shadow-xl' : 'bg-muted/30 border-dashed border-border opacity-60'}`}>
                    <div className="text-4xl md:text-5xl">{isEarned ? ach.icon : "🔒"}</div>
                    <div>
                      <h3 className={`text-lg md:text-xl font-black ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>{ach.name}</h3>
                      <p className="text-sm md:text-muted-foreground font-medium">{ach.desc}</p>
                      {isEarned && <div className="mt-2 text-[10px] md:text-xs font-black uppercase text-yellow-600 flex items-center gap-1"><Sparkles className="w-3 h-3 ml-1" /> مفتوح</div>}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
