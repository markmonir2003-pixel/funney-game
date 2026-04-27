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
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push("/teacher")}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{lesson.name}</h1>
              <p className="text-slate-400">Manage Questions ({lesson.questions.length})</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Question
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
                  <label className="text-sm font-medium text-purple-300">Question Text</label>
                  <textarea
                    required
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                    placeholder="Enter your funny question here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {options.map((opt, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-medium text-slate-400">Option {idx + 1}</label>
                        <button
                          type="button"
                          onClick={() => setCorrectIdx(idx)}
                          className={`text-xs px-2 py-0.5 rounded ${correctIdx === idx ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {correctIdx === idx ? 'Correct Answer' : 'Mark as Correct'}
                        </button>
                      </div>
                      <input
                        required
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className={`w-full bg-slate-900 border ${correctIdx === idx ? 'border-green-500/50' : 'border-slate-700'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 transition-all outline-none`}
                        placeholder={`Choice ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Easy (100 XP)</option>
                      <option value="medium">Medium (150 XP)</option>
                      <option value="hard">Hard (250 XP)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Explanation (Optional)</label>
                    <input
                      type="text"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Why is this answer correct?"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-700 pt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Discard</Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8">Save Question</Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {lesson.questions.length === 0 ? (
            <div className="py-20 text-center bg-slate-800/20 border border-slate-800 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No questions yet. Click "Add Question" to begin.</p>
            </div>
          ) : (
            lesson.questions.map((q, idx) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl group hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Question {idx + 1}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                        q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-lg text-white font-medium mb-4">{q.questionText}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx} 
                          className={`text-sm py-2 px-3 rounded-lg flex items-center gap-2 ${
                            q.correctAnswer === oIdx ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-slate-900/50 text-slate-400 border border-transparent'
                          }`}
                        >
                          {q.correctAnswer === oIdx && <CheckCircle2 className="w-3 h-3" />}
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
