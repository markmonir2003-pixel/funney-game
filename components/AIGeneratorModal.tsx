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
    } catch (e) {
      toast.error("حدث خطأ غير متوقع");
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
            className="relative w-full max-w-xl bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-500/10 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground">مُوَلّد الأسئلة الذكي</h2>
                    <p className="text-sm text-muted-foreground">دع الذكاء الاصطناعي يبدع في وضع الأسئلة لك.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">موضوع الدرس</label>
                  <Input
                    placeholder="مثلاً: لغة HTML، الخوارزميات، تاريخ الحاسوب..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/50 border-border px-6 font-bold text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">عدد الأسئلة</label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full h-14 bg-muted/50 border border-border rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value={3}>3 أسئلة</option>
                      <option value={5}>5 أسئلة</option>
                      <option value={10}>10 أسئلة</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">مستوى الصعوبة</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full h-14 bg-muted/50 border border-border rounded-2xl px-4 font-bold outline-none focus:ring-2 focus:ring-cyan-500/50"
                    >
                      <option value="easy">سهل</option>
                      <option value="medium">متوسط</option>
                      <option value="hard">صعب</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-lg shadow-xl shadow-cyan-500/20 gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      جاري التفكير والإبداع...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-6 h-6" />
                      توليد الأسئلة الآن ✨
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>مدعوم بتقنية Google Gemini 1.5 Flash</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
