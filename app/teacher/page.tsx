"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getTeacherData, addCustomLesson, deleteCustomLesson, CustomLesson, encodeLesson } from "@/lib/teacherStorage";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  ChevronRight, 
  GraduationCap, 
  Share2, 
  QrCode, 
  BarChart3, 
  AlertTriangle 
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStorageData } from "@/lib/storage";

export default function TeacherPortal() {
  const [lessons, setLessons] = useState<CustomLesson[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<"lessons" | "analytics">("lessons");
  const [mistakes, setMistakes] = useState<[string, number][]>([]);
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonDesc, setNewLessonDesc] = useState("");

  useEffect(() => {
    setLessons(getTeacherData());
    const data = getStorageData();
    if (data.mistakeTracker) {
      const sortedMistakes = Object.entries(data.mistakeTracker)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      setMistakes(sortedMistakes);
    }
  }, []);

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

  const copyLink = (lesson: CustomLesson) => {
    const encoded = encodeLesson(lesson);
    const url = `${window.location.origin}/game/${encodeURIComponent(lesson.name)}?q=${encoded}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard! Share it with your students.");
  };

  const showQR = (lesson: CustomLesson) => {
    const encoded = encodeLesson(lesson);
    const url = `${window.location.origin}/game/${encodeURIComponent(lesson.name)}?q=${encoded}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrUrl, "_blank");
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 relative selection:bg-purple-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 pt-12 md:pt-0">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                Teacher Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground font-medium">Create adventures and track student success</p>
          </motion.div>

          <Link href="/">
            <Button variant="outline" className="rounded-xl border-border hover:bg-muted font-bold">
              Back to Home
            </Button>
          </Link>
        </header>

        <div className="flex gap-4 p-1 bg-muted w-fit rounded-2xl mb-12 border border-border">
          <Button 
            variant={activeTab === "lessons" ? "default" : "ghost"} 
            onClick={() => setActiveTab("lessons")}
            className="rounded-xl px-8 h-12 font-bold transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" /> My Quests
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "ghost"} 
            onClick={() => setActiveTab("analytics")}
            className="rounded-xl px-8 h-12 font-bold transition-all"
          >
            <BarChart3 className="w-4 h-4 mr-2" /> Student Insights
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "lessons" ? (
            <motion.div key="lessons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">All Quests</h2>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20"
                >
                  <Plus className="w-5 h-5 mr-2" /> New Quest
                </Button>
              </div>

              {isAdding && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-12">
                   <div className="bg-card border border-border p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                      <form onSubmit={handleAddLesson} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Quest Name</label>
                             <input
                               type="text"
                               placeholder="e.g., Intro to JavaScript"
                               value={newLessonName}
                               onChange={(e) => setNewLessonName(e.target.value)}
                               className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                               required
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                             <input
                               type="text"
                               placeholder="What is this quest about?"
                               value={newLessonDesc}
                               onChange={(e) => setNewLessonDesc(e.target.value)}
                               className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold"
                             />
                           </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-2">
                          <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl font-bold">Cancel</Button>
                          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 font-black">Create Adventure</Button>
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
                      className="group bg-card border border-border rounded-[2.5rem] p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-2xl"
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
                             <Button variant="outline" size="icon" className="rounded-xl border-border" onClick={() => showQR(lesson)}>
                                <QrCode className="w-4 h-4 text-orange-500" />
                             </Button>
                          </div>
                          <Link href={`/teacher/${lesson.id}`}>
                            <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-xl">
                              Manage Questions <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                       </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <div className="bg-card border border-border rounded-[3rem] p-10 shadow-xl">
                 <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-red-500/10 rounded-3xl">
                       <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black">Top Challenges</h2>
                       <p className="text-muted-foreground text-lg">These questions are causing the most trouble for your students.</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {mistakes.length === 0 ? (
                       <div className="text-center py-20 border-4 border-dashed border-muted rounded-[3rem]">
                          <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-xl font-bold text-muted-foreground italic">No data yet. It will appear once students start playing!</p>
                       </div>
                    ) : (
                       mistakes.map(([qText, count], i) => (
                          <div key={i} className="flex items-center justify-between p-8 bg-muted/30 rounded-[2rem] border border-border hover:border-red-500/50 transition-all">
                             <div className="flex items-center gap-6">
                                <span className="text-4xl font-black text-muted-foreground/20">#0{i+1}</span>
                                <p className="font-bold text-xl leading-snug max-w-2xl">{qText}</p>
                             </div>
                             <div className="text-right ml-4">
                                <span className="text-4xl font-black text-red-500">{count}</span>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Mistakes</p>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

              <div className="p-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-64 h-64" />
                 </div>
                 <h3 className="text-2xl font-black mb-4 relative z-10">Smart Teacher Tip 💡</h3>
                 <p className="text-white/80 font-medium text-lg leading-relaxed relative z-10 max-w-3xl">
                    High mistake counts usually mean a concept needs more visual explanation. Try adding a "Funny Fact" in the question's explanation field to help students remember the concept next time!
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
