"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeacherData, addCustomLesson, deleteCustomLesson, CustomLesson, encodeLesson } from "@/lib/teacherStorage";
import { saveLessonAction } from "@/app/actions/lessonActions";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Share2, 
  BarChart3, 
  AlertTriangle,
  Trophy 
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStorageData } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export default function TeacherPortal() {
  const [lessons, setLessons] = useState<CustomLesson[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"lessons" | "analytics">("lessons");
  const [mistakes, setMistakes] = useState<[string, number][]>([]);
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [globalScores, setGlobalScores] = useState<any[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const { userId } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const localLessons = getTeacherData();
    setLessons(localLessons);
    
    const data = getStorageData();
    if (data && data.mistakeTracker) {
      const sortedMistakes = Object.entries(data.mistakeTracker)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setMistakes(sortedMistakes);
    }

    if (activeTab === "analytics") {
      fetchGlobalScores();
    }
  }, [activeTab, isMounted]);

  const fetchGlobalScores = async () => {
    setIsLoadingScores(true);
    try {
      const { data, error } = await supabase
        .from('student_scores')
        .select(`
          *,
          lessons (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGlobalScores(data || []);
    } catch (e) {
      console.error("Failed to fetch global scores", e);
    } finally {
      setIsLoadingScores(false);
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonName.trim()) return;
    
    const newLesson = addCustomLesson(newLessonName, newLessonDesc);
    setLessons([...lessons, newLesson]);
    setNewLessonName("");
    setNewLessonDesc("");
    setIsAdding(false);
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm("Are you sure you want to delete this lesson and all its questions?")) {
      deleteCustomLesson(id);
      setLessons(lessons.filter(l => l.id !== id));
    }
  };

  const copyLink = async (lesson: CustomLesson) => {
    toast.info("Preparing cloud link...");
    const result = await saveLessonAction(lesson, userId || undefined);
    
    if (!result.success || !result.id) {
      toast.error("Failed to generate cloud link. Falling back to local link.");
      const encoded = encodeLesson(lesson);
      const url = `${window.location.origin}/game/${encodeURIComponent(lesson.name)}?q=${encoded}`;
      navigator.clipboard.writeText(url);
      return;
    }

    const url = `${window.location.origin}/game/${result.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Short cloud link copied to clipboard!");
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 relative selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-6 pt-8 md:pt-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 md:p-3 bg-purple-500/10 rounded-2xl">
                <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                لوحة تحكم المعلم
              </h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground font-medium">أنشئ مغامرات وتابع نجاح طلابك</p>
          </motion.div>

          <Link href="/">
            <Button variant="outline" className="w-full md:w-auto rounded-xl border-border hover:bg-muted font-bold h-12">
              العودة للرئيسية
            </Button>
          </Link>
        </header>

        <div className="grid grid-cols-2 p-1 bg-muted w-full md:w-fit rounded-2xl mb-8 md:mb-12 border border-border">
          <Button 
            variant={activeTab === "lessons" ? "default" : "ghost"} 
            onClick={() => setActiveTab("lessons")}
            className="rounded-xl px-4 md:px-8 h-12 font-bold transition-all text-sm md:text-base"
          >
            <BookOpen className="w-4 h-4 ml-2" /> مهماتي
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "ghost"} 
            onClick={() => setActiveTab("analytics")}
            className="rounded-xl px-4 md:px-8 h-12 font-bold transition-all text-sm md:text-base"
          >
            <BarChart3 className="w-4 h-4 ml-2" /> إحصائيات الطلاب
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "lessons" ? (
            <motion.div key="lessons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-row items-center justify-between mb-8 gap-4">
                <h2 className="text-xl md:text-2xl font-black">جميع المهمات</h2>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-4 md:px-6 h-12 font-bold shadow-lg shadow-primary/20 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5 ml-2" /> مهمة جديدة
                </Button>
              </div>

              {isAdding && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 md:mb-12">
                   <div className="bg-card border border-border p-5 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                      <form onSubmit={handleAddLesson} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">اسم المهمة</label>
                             <input
                               type="text"
                               placeholder="مثلاً: مقدمة في لغة جافا سكريبت"
                               value={newLessonName}
                               onChange={(e) => setNewLessonName(e.target.value)}
                               className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-right"
                               required
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">الوصف</label>
                             <input
                               type="text"
                               placeholder="عن ماذا تتحدث هذه المهمة؟"
                               value={newLessonDesc}
                               onChange={(e) => setNewLessonDesc(e.target.value)}
                               className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-right"
                             />
                           </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-2">
                          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl font-bold h-12">إلغاء</Button>
                          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 h-12 font-black">إنشاء المغامرة</Button>
                        </div>
                      </form>
                   </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lessons.length === 0 ? (
                  <div className="col-span-full py-24 text-center border-4 border-dashed border-muted rounded-[3rem] opacity-50">
                    <BookOpen className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-bold">No quests yet. Create your first one!</p>
                  </div>
                ) : (
                  lessons.map((lesson) => (
                    <motion.div
                      key={lesson.id}
                      className="group bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl"
                    >
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{lesson.name}</h3>
                             <p className="text-muted-foreground font-medium line-clamp-1">{lesson.description || "No description provided."}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                             <Trash2 className="w-5 h-5" />
                          </Button>
                       </div>

                       <div className="flex items-center justify-between pt-6 border-t border-border">
                          <div className="flex gap-2">
                             <Button variant="outline" size="icon" className="rounded-xl border-border" onClick={() => copyLink(lesson)}>
                                <Share2 className="w-4 h-4 text-primary" />
                             </Button>
                          </div>
                          <Link href={`/teacher/${lesson.id}`}>
                            <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-xl">
                               إدارة الأسئلة <ChevronRight className="w-4 h-4 ml-1 rotate-180" />
                            </Button>
                          </Link>
                       </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 md:space-y-8">
              <div className="bg-card border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl mb-8 md:mb-12">
                 <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                    <div className="flex flex-row items-center gap-4 md:gap-6 w-full">
                       <div className="p-3 md:p-4 bg-cyan-500/10 rounded-2xl md:rounded-3xl shrink-0">
                          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-cyan-500" />
                       </div>
                       <div>
                          <h2 className="text-xl md:text-3xl font-black">لوحة متصدري الطلاب</h2>
                          <p className="text-sm md:text-lg text-muted-foreground">أداء طلابك في الوقت الفعلي.</p>
                       </div>
                    </div>
                    <Button variant="outline" onClick={fetchGlobalScores} disabled={isLoadingScores} className="w-full md:w-auto rounded-xl font-bold border-border h-12">
                       {isLoadingScores ? "جاري..." : "تحديث البيانات"}
                    </Button>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                           <tr className="border-b border-border text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground">
                              <th className="pb-4 px-2 md:px-4 text-right">الطالب</th>
                              <th className="pb-4 px-2 md:px-4 text-right">الدرس</th>
                              <th className="pb-4 px-2 md:px-4 text-right">الدرجة</th>
                              <th className="pb-4 px-2 md:px-4 text-right hidden sm:table-cell">الدقة</th>
                              <th className="pb-4 px-2 md:px-4 text-left">التاريخ</th>
                           </tr>
                        </thead>
                       <tbody>
                          {globalScores.length === 0 ? (
                             <tr>
                                <td colSpan={5} className="py-20 text-center text-muted-foreground font-bold italic">
                                   بانتظار قيام أول طالب بإكمال مهمة...
                                </td>
                             </tr>
                          ) : (
                             globalScores.map((score, i) => (
                                 <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                   <td className="py-4 md:py-6 px-2 md:px-4 font-black text-foreground text-sm md:text-base">{score.student_name}</td>
                                   <td className="py-4 md:py-6 px-2 md:px-4 text-muted-foreground font-bold text-xs md:text-sm">{score.lessons?.name || "درس محذوف"}</td>
                                   <td className="py-4 md:py-6 px-2 md:px-4">
                                      <span className="bg-cyan-500/10 text-cyan-600 px-2 md:px-3 py-1 rounded-full font-black text-[10px] md:text-sm border border-cyan-500/20">
                                         {score.score}%
                                      </span>
                                   </td>
                                   <td className="py-4 md:py-6 px-2 md:px-4 font-bold text-foreground text-xs md:text-sm hidden sm:table-cell">{score.accuracy}%</td>
                                   <td className="py-4 md:py-6 px-2 md:px-4 text-left text-muted-foreground text-[10px] md:text-sm font-bold whitespace-nowrap">
                                      {new Date(score.created_at).toLocaleDateString()}
                                   </td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

               <div className="bg-card border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl">
                  <div className="flex flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="p-3 md:p-4 bg-red-500/10 rounded-2xl md:rounded-3xl shrink-0">
                       <AlertTriangle className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-3xl font-black">أكبر التحديات</h2>
                       <p className="text-sm md:text-lg text-muted-foreground">هذه الأسئلة تسبب أكبر قدر من الأخطاء لطلابك.</p>
                    </div>
                  </div>

                 <div className="space-y-6">
                    {mistakes.length === 0 ? (
                       <div className="text-center py-20 border-4 border-dashed border-muted rounded-[3rem]">
                          <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-xl font-bold text-muted-foreground italic">لا توجد بيانات بعد. ستظهر عند بدء الطلاب في اللعب!</p>
                       </div>
                    ) : (
                       mistakes.map(([qText, count], i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 bg-muted/30 rounded-[1.5rem] md:rounded-[2rem] border border-border hover:border-red-500/50 transition-all gap-4">
                           <div className="flex items-start sm:items-center gap-4 md:gap-6">
                              <span className="text-2xl md:text-4xl font-black text-muted-foreground/20 shrink-0">#0{i+1}</span>
                              <p className="font-bold text-base md:text-xl leading-snug">{qText}</p>
                           </div>
                           <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                              <span className="text-3xl md:text-4xl font-black text-red-500">{count}</span>
                              <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">أخطاء</p>
                           </div>
                        </div>
                       ))
                    )}
                 </div>
              </div>

               <div className="p-6 md:p-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group text-right">
                  <div className="absolute -left-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform">
                     <GraduationCap className="w-48 h-48 md:w-64 md:h-64" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 relative z-10">نصيحة المعلم الذكي 💡</h3>
                  <p className="text-white/80 font-medium text-sm md:text-lg leading-relaxed relative z-10 max-w-3xl">
                     الأعداد المرتفعة للأخطاء تعني عادةً أن المفهوم يحتاج إلى شرح بصري أكثر. حاول إضافة "حقيقة ممتعة" في حقل شرح السؤال لمساعدة الطلاب على تذكر المفهوم في المرة القادمة!
                  </p>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
