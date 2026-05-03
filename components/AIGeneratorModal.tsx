"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, X, PlusCircle, CheckCircle2 } from "lucide-react";
import { generateQuestionsAction } from "@/app/actions/aiActions";
import { toast } from "sonner";

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: any[]) => void;
}

export function AIGeneratorModal({ isOpen, onClose, onQuestionsGenerated }: AIGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("يرجى إدخال موضوع لتوليد الأسئلة");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateQuestionsAction(topic, count, difficulty);
      if (result.success && result.questions) {
        onQuestionsGenerated(result.questions);
        toast.success(`تم توليد ${result.questions.length} أسئلة بنجاح!`);
        onClose();
        setTopic("");
      } else {
        toast.error(result.error || "فشل توليد الأسئلة");
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ غير متوقع");
    } finally {

      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-2 md:p-3 bg-cyan-500/10 rounded-2xl shrink-0">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-cyan-500" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-black text-foreground truncate">مُوَلّد الأسئلة الذكي</h2>
                    <p className="text-[10px] md:text-sm text-muted-foreground line-clamp-1">دع الذكاء الاصطناعي يبدع في وضع الأسئلة لك.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">موضوع الدرس</label>
                  <Input
                    placeholder="مثلاً: لغة HTML، الخوارزميات..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/50 border-border px-4 md:px-6 font-bold text-right text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">عدد الأسئلة</label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full h-12 md:h-14 bg-muted/50 border border-border rounded-xl md:rounded-2xl px-3 md:px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500/50 text-xs md:text-base"
                    >
                      <option value={3}>3 أسئلة</option>
                      <option value={5}>5 أسئلة</option>
                      <option value={10}>10 أسئلة</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">مستوى الصعوبة</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-12 md:h-14 bg-muted/50 border border-border rounded-xl md:rounded-2xl px-3 md:px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500/50 text-xs md:text-base"
                    >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-base md:text-lg shadow-xl shadow-cyan-500/20 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                      جاري الإبداع...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                      توليد الآن ✨
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 justify-center text-[8px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>مدعوم بتقنية Llama 3.3 فائقة السرعة</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
