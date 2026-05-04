"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  getTeacherData, 
  saveTeacherData, 
  addQuestionToLesson, 
  deleteQuestionFromLesson,
  CustomLesson,
  CustomQuestion
} from "@/lib/teacherStorage";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, Save, Sparkles } from "lucide-react";
import { AIGeneratorModal } from "@/components/AIGeneratorModal";
import { toast } from "sonner";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export default function QuestionEditor() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lesson as string;
  
  const [lesson, setLesson] = useState<CustomLesson | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // New Question Form State
  const [newQText, setNewQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [explanation, setExplanation] = useState("");

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: lesson?.questions.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Increased estimate for mobile safety
    overscan: 5,
  });

  useEffect(() => {
    if (!isMounted) return;
    const data = getTeacherData();
    const found = data.find(l => l.id === lessonId);
    if (found) setLesson(found);
    else router.push("/teacher");
  }, [lessonId, router, isMounted]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || options.some(o => !o.trim())) return;

    addQuestionToLesson(lessonId, {
      lessonName: lesson?.name || "",
      questionText: newQText,
      options: [...options],
      correctAnswer: correctIdx,
      difficulty,
      explanation
    });

    // Refresh lesson data
    const data = getTeacherData();
    const found = data.find(l => l.id === lessonId);
    if (found) setLesson(found);

    // Reset form
    setNewQText("");
    setOptions(["", "", "", ""]);
    setCorrectIdx(0);
    setDifficulty("easy");
    setExplanation("");
    setIsAdding(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    deleteQuestionFromLesson(lessonId, qId);
    setLesson(prev => prev ? {
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    } : null);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const handleAIGenerated = (newQuestions: any[]) => {
    newQuestions.forEach(q => {
      addQuestionToLesson(lessonId, {
        lessonName: lesson?.name || "",
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        explanation: q.explanation
      });
    });

    // Refresh lesson data
    const data = getTeacherData();
    const found = data.find(l => l.id === lessonId);
    if (found) setLesson(found);
    
    toast.success(`تمت إضافة ${newQuestions.length} سؤال جديد!`);
  };

  if (!isMounted || !lesson) return null;

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col gap-4 mb-6 pt-2 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/teacher")}
                className="text-slate-400 hover:text-white p-1 md:p-2 h-auto shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 ml-1 rotate-180" /> <span className="text-xs md:text-sm">عودة</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg md:text-3xl font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-none">
                  {lesson.name}
                </h1>
                <p className="text-[10px] md:text-base text-slate-400 font-medium">إدارة الأسئلة ({lesson.questions.length})</p>
              </div>
            </div>
            <div className="flex flex-row gap-2 sm:gap-3">
              <Button 
                onClick={() => setIsGeneratingAI(true)}
                variant="outline"
                className="flex-1 sm:flex-none border-cyan-500/30 hover:bg-cyan-500/10 h-10 md:h-12 rounded-xl font-bold text-cyan-400 gap-1.5 text-[10px] md:text-sm px-3 md:px-4"
              >
                <Sparkles className="w-3.5 h-3.5 md:w-5 md:h-5" /> ذكاء اصطناعي
              </Button>
              <Button 
                onClick={() => setIsAdding(true)}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 h-10 md:h-12 rounded-xl font-bold text-[10px] md:text-sm px-3 md:px-4"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" /> إضافة سؤال
              </Button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/30 p-6 rounded-2xl mb-8 shadow-xl shadow-purple-500/10"
            >
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-300">نص السؤال</label>
                  <textarea
                    required
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 transition-all outline-none text-right"
                    placeholder="اكتب سؤالك المرح هنا..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الخيار {idx + 1}</label>
                        <button
                          type="button"
                          onClick={() => setCorrectIdx(idx)}
                          className={`text-[10px] md:text-xs px-2 py-1 rounded-lg font-black uppercase transition-all ${correctIdx === idx ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-700'}`}
                        >
                          {correctIdx === idx ? 'الإجابة الصحيحة' : 'تحديد كصح'}
                        </button>
                      </div>
                      <input
                        required
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className={`w-full bg-slate-900 border ${correctIdx === idx ? 'border-green-500/50' : 'border-slate-700'} rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-right font-bold`}
                        placeholder={`اكتب الخيار ${idx + 1}...`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">الصعوبة</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">سهل (100 نقطة)</option>
                      <option value="medium">متوسط (150 نقطة)</option>
                      <option value="hard">صعب (250 نقطة)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">الشرح (اختياري)</label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500 text-right"
                      placeholder="لماذا هذه الإجابة صحيحة؟"
                    />
                  </div>
                </div>

                 <div className="flex flex-col md:flex-row justify-end gap-3 border-t border-slate-700 pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="h-12 rounded-xl font-bold">تجاهل</Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8 h-12 rounded-xl font-black">حفظ السؤال</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          ref={parentRef}
          className="max-h-[75vh] overflow-auto scroll-smooth pr-2 custom-scrollbar"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {lesson.questions.length === 0 ? (
              <div className="py-20 text-center bg-slate-800/20 border border-slate-800 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">لا توجد أسئلة بعد. اضغط على "إضافة سؤال" للبدء.</p>
              </div>
            ) : (
              virtualizer.getVirtualItems().map((virtualItem) => {
                const q = lesson.questions[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      minHeight: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '1.5rem',
                    }}
                  >
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/40 border border-slate-700/50 rounded-2xl md:rounded-3xl p-5 md:p-8 relative group h-full"
                    >
                      <div className="flex flex-col-reverse md:flex-row justify-between items-start gap-5">
                        <div className="flex-1 w-full min-w-0">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded-md">سؤال {virtualItem.index + 1}</span>
                            <span className={`text-[8px] md:text-[10px] px-2.5 py-1 rounded-full font-black uppercase ${
                              q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                            </span>
                          </div>
                          <p className="text-base md:text-xl text-white font-bold mb-6 leading-relaxed line-clamp-3 md:line-clamp-none">{q.questionText}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt, oIdx) => (
                              <div 
                                key={oIdx} 
                                className={`text-[11px] md:text-sm py-2.5 px-4 rounded-xl flex items-center gap-3 transition-all ${
                                  q.correctAnswer === oIdx ? 'bg-green-500/15 text-green-300 border border-green-500/40' : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0 ${q.correctAnswer === oIdx ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-slate-700'}`} />
                                <span className="font-bold truncate">{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="w-full md:w-auto flex justify-end shrink-0">
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all bg-slate-900/40"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <AIGeneratorModal 
          isOpen={isGeneratingAI} 
          onClose={() => setIsGeneratingAI(false)} 
          onQuestionsGenerated={handleAIGenerated} 
        />
      </div>
    </main>
  );
}
