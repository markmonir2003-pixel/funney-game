"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Share2 
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TeacherPortal() {
  const [lessons, setLessons] = useState<CustomLesson[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { userId } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const localLessons = getTeacherData();
    setLessons(localLessons);
  }, [isMounted]);

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
    toast.info("جاري تجهيز الرابط المختصر...", { duration: 1500 });
    
    // 1. Try Cloud Short Link (Professional Method)
    const result = await saveLessonAction(lesson, userId || undefined);
    
    if (result.success && result.id) {
      const url = `${window.location.origin}/game/${result.id}`;
      navigator.clipboard.writeText(url);
      toast.success("تم نسخ الرابط السحابي القصير! 🚀");
      return;
    }

    // 2. Fallback: Portable Link (Encoded)
    const encoded = encodeLesson(lesson);
    const portableUrl = `${window.location.origin}/game/q?q=${encoded}`;

    try {
      // Try to shorten the portable link using a public API (TinyURL)
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(portableUrl)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        navigator.clipboard.writeText(shortUrl);
        toast.success("تم نسخ رابط خارجي مختصر! ✨");
        return;
      }
    } catch (e) {
      console.warn("External shortener failed, using raw encoded link");
    }

    // 3. Final Fallback: Raw Encoded Link (Already minified)
    navigator.clipboard.writeText(portableUrl);
    toast.success("تم نسخ الرابط المشفر (أطول قليلاً لكنه يعمل بدون إنترنت)");
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
      </div>
    </main>
  );
}
