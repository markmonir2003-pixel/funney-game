"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, Zap, Target, Brain, Activity } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useEffect, memo, useState } from "react";

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
  /** Seconds still on the clock when the answer is submitted (optional) */
  timeRemaining?: number;
  /** The total time limit for the question (optional) */
  timeLimit?: number;
}

// ─── Option button — memoised so it only re-renders when its own state changes ──
interface OptionProps {
  option: string;
  index: number;
  answered: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  highContrast: boolean;
  visualCues: boolean;
  optionSizeClass: string;
  onSelect: (index: number) => void;
}

const AnswerOption = memo(function AnswerOption({
  option,
  index,
  answered,
  isSelected,
  isCorrect,
  highContrast,
  visualCues,
  optionSizeClass,
  onSelect,
}: OptionProps) {
  const showCorrect = answered && isCorrect;
  const showIncorrect = answered && isSelected && !isCorrect;

  let cardClasses = "relative w-full h-auto p-4 md:p-6 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300 ";

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
    <button
      onClick={() => !answered && onSelect(index)}
      disabled={answered}
      className={cardClasses}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-base md:text-lg shrink-0 ${
          !answered ? (highContrast ? "bg-white text-black" : "bg-muted border border-border text-muted-foreground") :
          isCorrect ? "bg-green-500 text-white" :
          isSelected ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
        }`}>
          {["أ", "ب", "ج", "د"][index]}
        </div>
        <span className={`flex-1 font-bold ${optionSizeClass}`}>{option}</span>
        {visualCues && isCorrect && answered && (
          <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full mr-2">
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
            <span className="text-[8px] font-black text-green-500 uppercase">صوت نجاح</span>
          </div>
        )}
        {visualCues && showIncorrect && (
          <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-full mr-2">
            <Activity className="w-3 h-3 text-red-500 animate-bounce" />
            <span className="text-[8px] font-black text-red-500 uppercase">صوت خطأ</span>
          </div>
        )}
        {showCorrect && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />}
        {showIncorrect && <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />}
      </div>
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────

function getDifficultyStyles(difficulty: string) {
  switch (difficulty) {
    case "easy":
      return { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: <Zap className="w-4 h-4" />, label: "سهل" };
    case "medium":
      return { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: <Target className="w-4 h-4" />, label: "متوسط" };
    case "hard":
      return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: <Brain className="w-4 h-4" />, label: "صعب" };
    default:
      return { color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", icon: <Zap className="w-4 h-4" />, label: "غير معروف" };
  }
}

export const QuestionCard = memo(function QuestionCard({
  question,
  selectedAnswer,
  answered,
  onSelectAnswer,
  onNext,
  timeRemaining = 0,
  timeLimit = 30,
}: QuestionCardProps) {
  const { settings, speak } = useAccessibility();

  // ── Speed-burst state — show motivational overlay on fast correct answer ──
  const [showSpeedBurst, setShowSpeedBurst] = useState(false);

  useEffect(() => {
    // Reset badge whenever question changes
    setShowSpeedBurst(false);

    // Only trigger if answered correctly within the first 3 seconds
    if (answered && selectedAnswer === question.correctAnswer && timeRemaining >= (timeLimit - 3)) {
      setShowSpeedBurst(true);
      const t = setTimeout(() => setShowSpeedBurst(false), 2000);
      return () => clearTimeout(t);
    }
  }, [answered, question.id]);

  // Speak question on load — only fires when question identity changes
  useEffect(() => {
    if (settings.textToSpeech && !answered) {
      const optionsText = question.options
        .map((opt, i) => `الخيار ${["الأول", "التاني", "التالت", "الرابع"][i]}: ${opt}`)
        .join(" , ");
      speak(`${question.questionText} , , ${optionsText}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, settings.textToSpeech]);

  // Speak feedback immediately after answering
  useEffect(() => {
    if (answered && settings.textToSpeech) {
      speak(selectedAnswer === question.correctAnswer ? "الإجابة صح" : "الإجابة غلط");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "large": return "text-3xl md:text-5xl";
      case "extra-large": return "text-4xl md:text-6xl";
      default: return "text-2xl md:text-4xl";
    }
  };

  const getOptionSizeClass = () => {
    switch (settings.fontSize) {
      case "large": return "text-lg md:text-xl";
      case "extra-large": return "text-xl md:text-2xl";
      default: return "text-base md:text-lg";
    }
  };

  const diff = getDifficultyStyles(question.difficulty);
  const optionSizeClass = getOptionSizeClass();

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      key={question.id}
    >
      {/* ── Speed-burst overlay ── */}
      <AnimatePresence>
        {showSpeedBurst && (
          <motion.div
            className="fixed top-24 left-0 right-0 z-[200] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          >
            {/* Main badge */}
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              {/* Label */}
              <motion.div
                className="px-4 py-2 rounded-full bg-yellow-400 text-slate-900 font-black text-sm md:text-lg tracking-tight shadow-xl shadow-yellow-400/30 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>صاروخ طيارة!</span>
                <span className="text-[10px] md:text-xs opacity-80">+50 XP</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`relative bg-card backdrop-blur-2xl border ${settings.highContrast ? "border-foreground border-4 bg-black" : "border-border"} rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-2xl overflow-hidden`}>
        {/* Subtle decorative glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${diff.bg} blur-[100px] pointer-events-none opacity-20`} />

        <div className="relative z-10">
          {/* Difficulty badge */}
          <div className="mb-4 md:mb-8 flex items-center justify-between">
            <div className={`inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black tracking-widest uppercase border ${diff.bg} ${diff.color} ${diff.border}`}>
              {diff.icon}
              {diff.label}
            </div>
            {answered && (
              <div className={`font-black uppercase tracking-tighter text-[10px] md:text-sm ${selectedAnswer === question.correctAnswer ? "text-green-500" : "text-red-500"}`}>
                {selectedAnswer === question.correctAnswer ? "عمل رائع! +خبرة" : "محاولة جيدة!"}
              </div>
            )}
          </div>

          {/* Question text */}
          <h2 className={`${getFontSizeClass()} font-black text-foreground mb-6 md:mb-10 leading-tight tracking-tight`}>
            {question.questionText}
          </h2>

          {/* Answer options — each memoised individually */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-10">
            {question.options.map((option, index) => (
              <AnswerOption
                key={index}
                option={option}
                index={index}
                answered={answered}
                isSelected={selectedAnswer === index}
                isCorrect={index === question.correctAnswer}
                highContrast={settings.highContrast}
                visualCues={settings.visualCues}
                optionSizeClass={optionSizeClass}
                onSelect={onSelectAnswer}
              />
            ))}
          </div>

          {/* Explanation and Next button */}
          <div className="min-h-[60px] md:min-h-[80px]">
            {answered && (
              <motion.div
                className="space-y-4 md:space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {question.explanation && (
                  <div className="p-4 md:p-6 bg-muted/50 backdrop-blur-md rounded-xl md:rounded-2xl border border-border text-foreground font-medium leading-relaxed text-right text-sm md:text-base">
                    <span className="text-primary font-black uppercase text-[10px] md:text-xs tracking-widest block mb-1 md:mb-2">هل تعلم؟</span>
                    {question.explanation}
                  </div>
                )}

                <Button
                  onClick={onNext}
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-black text-lg md:text-xl shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex-row-reverse"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 mr-2 rotate-180" />
                  متابعة المهمة
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
