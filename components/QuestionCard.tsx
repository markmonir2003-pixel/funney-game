"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, Zap, Target, Brain } from "lucide-react";

interface Question {
  id: number | string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  answered: boolean;
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  answered,
  onSelectAnswer,
  onNext,
}: QuestionCardProps) {
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: <Zap className="w-4 h-4" /> };
      case "medium":
        return { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: <Target className="w-4 h-4" /> };
      case "hard":
        return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: <Brain className="w-4 h-4" /> };
      default:
        return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", icon: <Zap className="w-4 h-4" /> };
    }
  };

  const diff = getDifficultyStyles(question.difficulty);

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      key={question.id}
    >
      <div className="relative bg-card backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${diff.bg} blur-[100px] pointer-events-none opacity-20`} />

        <div className="relative z-10">
          {/* Difficulty badge */}
          <div className="mb-8 flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${diff.bg} ${diff.color} ${diff.border}`}>
              {diff.icon}
              {question.difficulty}
            </div>
            {answered && (
              <div className={`font-black uppercase tracking-tighter text-sm ${selectedAnswer === question.correctAnswer ? 'text-green-500' : 'text-red-500'}`}>
                {selectedAnswer === question.correctAnswer ? 'Great Job! +XP' : 'Nice Try!'}
              </div>
            )}
          </div>

          {/* Question text */}
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 leading-tight tracking-tight">
            {question.questionText}
          </h2>

          {/* Answer options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correctAnswer;
              const showCorrect = answered && isCorrect;
              const showIncorrect = answered && isSelected && !isCorrect;

              let cardClasses = "relative w-full h-auto p-6 rounded-2xl border-2 text-left transition-all duration-300 ";
              
              if (!answered) {
                cardClasses += "bg-muted/50 border-border hover:border-primary/50 hover:bg-primary/5 hover:translate-y-[-2px]";
              } else {
                if (isCorrect) {
                  cardClasses += "bg-green-500/10 border-green-500 text-foreground shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                } else if (isSelected) {
                  cardClasses += "bg-red-500/10 border-red-500 text-foreground";
                } else {
                  cardClasses += "bg-muted/30 border-border/50 text-muted-foreground opacity-50";
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => !answered && onSelectAnswer(index)}
                  disabled={answered}
                  className={cardClasses}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                      !answered ? 'bg-muted border border-border text-muted-foreground' :
                      isCorrect ? 'bg-green-500 text-white' :
                      isSelected ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 font-bold text-lg">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    {showIncorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation and Next button */}
          <div className="min-h-[80px]">
            {answered && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {question.explanation && (
                  <div className="p-6 bg-muted/50 backdrop-blur-md rounded-2xl border border-border text-foreground font-medium leading-relaxed">
                    <span className="text-primary font-black uppercase text-xs tracking-widest block mb-2">Did you know?</span>
                    {question.explanation}
                  </div>
                )}

                <Button
                  onClick={onNext}
                  className="w-full h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-xl shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Continue Mission
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
