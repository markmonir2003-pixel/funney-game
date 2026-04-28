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
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function QuestionEditor() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lesson as string;
  
  const [lesson, setLesson] = useState<CustomLesson | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Question Form State
  const [newQText, setNewQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const data = getTeacherData();
    const found = data.find(l => l.id === lessonId);
    if (found) setLesson(found);
    else router.push("/teacher");
  }, [lessonId, router]);

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

  if (!lesson) return null;

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 pt-4 md:pt-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/teacher")}
              className="text-slate-400 hover:text-white p-2 h-auto"
            >
              <ArrowLeft className="w-5 h-5 ml-1 rotate-180" /> عودة
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{lesson.name}</h1>
              <p className="text-sm md:text-base text-slate-400 font-medium">إدارة الأسئلة ({lesson.questions.length})</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 h-12 rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 ml-2" /> إضافة سؤال
          </Button>
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

        <div className="space-y-4">
          {lesson.questions.length === 0 ? (
            <div className="py-20 text-center bg-slate-800/20 border border-slate-800 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">لا توجد أسئلة بعد. اضغط على "إضافة سؤال" للبدء.</p>
            </div>
          ) : (
            lesson.questions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl md:rounded-3xl p-4 md:p-8"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] md:text-xs font-black text-purple-400 uppercase tracking-widest">سؤال {idx + 1}</span>
                      <span className={`text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                        q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {q.difficulty === 'easy' ? 'سهل' : q.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                      </span>
                    </div>
                    <p className="text-base md:text-lg text-white font-bold mb-6 leading-relaxed">{q.questionText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`text-sm py-3 px-4 rounded-xl flex items-center gap-3 transition-all ${
                            q.correctAnswer === oIdx ? 'bg-green-500/10 text-green-300 border-2 border-green-500/30' : 'bg-slate-900/50 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${q.correctAnswer === oIdx ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-slate-700'}`} />
                          <span className="font-medium">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
