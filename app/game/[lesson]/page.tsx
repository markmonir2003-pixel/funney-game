"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GameHeader } from "@/components/GameHeader";
import { QuestionCard } from "@/components/QuestionCard";
import { ResultsCard } from "@/components/ResultsCard";
import { MazeProgress } from "@/components/MazeProgress";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/useGameState";
import {
  calculateXP,
  calculateAccuracy,
  calculateScore,
} from "@/lib/gameLogic";
import {
  addScore,
  updateLessonStats,
  updateGameProgress,
} from "@/lib/storage";
import { getTeacherData, decodeLesson, getLessonFromCloud } from "@/lib/teacherStorage";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { supabase } from "@/lib/supabase";
import { saveScoreAction } from "@/app/actions/lessonActions";
import { useUser } from "@clerk/nextjs";

interface Question {
  id: number;
  lessonName: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

import { getStorageData, usePowerup, trackMistake } from "@/lib/storage";
import { Timer, ShieldCheck, FastForward } from "lucide-react";
import { useSound } from "@/hooks/useSound";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lessonParam = decodeURIComponent(params.lesson as string);
  const { sync } = useSyncProgress();
  const { user } = useUser();
  const [lessonName, setLessonName] = useState(lessonParam);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState("default");
  const [powerups, setPowerups] = useState({ freeze: 0, shield: 0, skip: 0 });

  const gameState = useGameState(questions);
  const {
    selectAnswer,
    nextQuestion,
    resetGame,
    decrementTime,
    isGameOver,
    currentQuestion,
    state,
    setTimeRemaining,
  } = gameState;

  // Load data
  useEffect(() => {
    // 0. Check if it's a UUID (Cloud Lesson)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(lessonParam)) {
      getLessonFromCloud(lessonParam).then(cloudLesson => {
        if (cloudLesson) {
          setQuestions(cloudLesson.questions as any);
          setLessonName(cloudLesson.name);
          setLoading(false);
        } else {
          setLoading(false);
        }
      });
      return;
    }

    // 1. Check if data is in URL (Portable Quest Fallback)
    const encodedData = searchParams.get("q");
    if (encodedData) {
      const decodedLesson = decodeLesson(encodedData);
      if (decodedLesson && decodedLesson.questions.length > 0) {
        setQuestions(decodedLesson.questions as any);
        setLoading(false);
        return;
      }
    }

    const lessonLower = lessonParam.toLowerCase();
    
    // Mapping Arabic names to English keys in questions.json
    const lessonMapping: Record<string, string> = {
      "الخوارزميات": "algorithms",
      "خرائط التدفق": "flowcharts",
      "المتغيرات": "variables",
      "أنواع البيانات": "data types",
      "المدخلات والمخرجات": "input/output",
      "الشروط": "conditions",
      "الحلقات": "loops",
      "المعاملات": "operators",
      "اكتشاف الأخطاء": "error detection"
    };

    const searchKey = lessonMapping[lessonParam] || lessonLower;

    // 2. Check if it's a local teacher lesson
    const teacherLessons = getTeacherData();
    const localLesson = teacherLessons.find(l => l.name.toLowerCase() === lessonLower || l.name === lessonParam);

    if (localLesson && localLesson.questions.length > 0) {
      setQuestions(localLesson.questions as any);
      setLoading(false);
    } else {
      // 3. Fallback to default questions
      fetch("/data/questions.json")
        .then((res) => res.json())
        .then((data: Question[]) => {
          const filteredQuestions = data.filter(
            (q) => q.lessonName.toLowerCase() === searchKey
          );
          setQuestions(filteredQuestions);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [lessonParam, searchParams]);

  const { play } = useSound();

  const handleUsePowerup = (type: "freeze" | "shield" | "skip") => {
    if (usePowerup(type)) {
      play("powerup");
      setPowerups({ ...powerups, [type]: powerups[type] - 1 });
      if (type === "freeze") {
         setTimeRemaining(prev => prev + 10);
      } else if (type === "skip") {
         handleSelectAnswer(currentQuestion!.correctAnswer);
      } else if (type === "shield") {
         alert("تم تفعيل الدرع! أنت بأمان في هذا السؤال.");
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (!state.answered && !isGameOver && state.timeRemaining > 0) {
      const timer = setTimeout(() => {
        decrementTime();
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (state.timeRemaining === 0 && !state.answered && !isGameOver) {
      handleTimeout();
    }
  }, [state.timeRemaining, state.answered, isGameOver, decrementTime]);

  const handleTimeout = useCallback(() => {
    play("wrong");
    selectAnswer(-1);
  }, [selectAnswer, play]);

  const handleSelectAnswer = (index: number) => {
    if (!state.answered) {
      if (index === currentQuestion?.correctAnswer) {
        play("correct");
      } else {
        play("wrong");
        if (currentQuestion) trackMistake(currentQuestion.questionText);
      }
      selectAnswer(index);
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;
    play("click");

    const isCorrect =
      state.selectedAnswer === currentQuestion.correctAnswer;
    const xpEarned = isCorrect
      ? calculateXP(
          currentQuestion.difficulty,
          state.comboStreak + 1,
          state.timeRemaining
        )
      : 0;

    nextQuestion(xpEarned);
  };

  useEffect(() => {
    if (isGameOver && !gameEnded) {
      handleGameEnd();
    }
  }, [isGameOver, gameEnded]);

  const handleGameEnd = () => {
    // Prevent multiple calls
    if (gameEnded) return;

    const accuracy = calculateAccuracy(
      state.score,
      state.questions.length
    );
    const score = calculateScore(state.score, state.questions.length);

    addScore({
      lesson: lessonName,
      score,
      date: new Date().toISOString().split("T")[0],
      accuracy,
      xpEarned: state.xpEarned,
    });

    updateLessonStats(lessonName, score);
    updateGameProgress(state.xpEarned, lessonName, score);

    // Sync to cloud
    sync();

    // 4. Save to global scores table (Server Action) for teacher visibility
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(lessonParam)) {
      saveScoreAction({
        lesson_id: lessonParam,
        student_id: user?.id,
        student_name: user?.fullName || user?.username || "Guest Student",
        score: score,
        accuracy: accuracy,
        xp_earned: state.xpEarned
      }).catch(err => console.error("Error saving score:", err));
    }

    setGameEnded(true);
  };

  const handleRetry = () => {
    resetGame();
    setGameEnded(false);
  };

  const handleBackToLessons = () => {
    router.push("/lessons");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-5xl inline-block"
          >
            🎮
          </motion.div>
          <p className="text-xl text-muted-foreground font-bold">جاري تحميل الدرس...</p>
        </motion.div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div
          className="text-center space-y-6 bg-card border border-border rounded-[2.5rem] p-12 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">🙊</div>
          <p className="text-3xl font-black text-foreground">
            أوه! هذه المهمة فارغة
          </p>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">
            يبدو أن هذا الدرس ينتظر بعض الأسئلة الممتعة. ربما لا يزال المعلم يشرب قهوته! ☕
          </p>
          <Button
            onClick={() => router.push("/lessons")}
            className="bg-primary hover:opacity-90 text-primary-foreground font-black py-6 px-8 rounded-2xl shadow-xl shadow-primary/20 text-lg"
          >
            العودة للساحة
          </Button>
        </motion.div>
      </main>
    );
  }

  if (gameEnded) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <ResultsCard
          score={state.score}
          totalQuestions={state.questions.length}
          xpEarned={state.xpEarned}
          lesson={lessonName}
          onRetry={handleRetry}
          onBackToLessons={handleBackToLessons}
        />
      </main>
    );
  }

  if (isGameOver && !gameEnded) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl inline-block"
          >
            🏁
          </motion.div>
          <p className="text-2xl font-black text-foreground">جاري حساب النتائج وتجهيز الشهادة...</p>
          <p className="text-muted-foreground font-medium">عمل رائع! لقد وصلت لخط النهاية.</p>
        </div>
      </main>
    );
  }

  const showFireEffect = state.comboStreak > 0 && state.comboStreak % 5 === 0 && state.answered && state.selectedAnswer === currentQuestion?.correctAnswer;

  return (
    <main className="min-h-screen flex flex-col bg-background overflow-hidden">
      <AnimatePresence>
        {showFireEffect && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
                filter: ["drop-shadow(0 0 20px rgba(239,68,68,0.5))", "drop-shadow(0 0 40px rgba(249,115,22,0.8))", "drop-shadow(0 0 20px rgba(239,68,68,0.5))"]
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-9xl"
            >
              🔥
            </motion.div>
            <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
      <GameHeader
        xp={state.xpEarned}
        comboStreak={state.comboStreak}
        currentQuestion={state.currentQuestionIndex + 1}
        totalQuestions={state.questions.length}
        timeRemaining={state.timeRemaining}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <MazeProgress
              currentStep={state.currentQuestionIndex}
              totalSteps={state.questions.length}
              score={state.score}
              incorrectCount={state.currentQuestionIndex - state.score}
              selectedSkin={selectedSkin}
              isFinished={isGameOver}
              didWin={calculateAccuracy(state.score, state.questions.length) >= 50}
              status={state.answered ? (state.selectedAnswer === currentQuestion?.correctAnswer ? "happy" : "sad") : "idle"}
              userImage={user?.imageUrl}
            />
          </div>

          {/* Power-ups UI */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-3">
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("freeze")}
                disabled={powerups.freeze === 0 || state.answered}
                className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex flex-col gap-1 border-2 border-blue-500/30 hover:bg-blue-500/10"
                title="تجميد الوقت (+10 ثوانٍ)"
             >
                <Timer className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                <span className="text-[8px] md:text-[10px] font-black">{powerups.freeze}</span>
             </Button>
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("shield")}
                disabled={powerups.shield === 0 || state.answered}
                className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex flex-col gap-1 border-2 border-green-500/30 hover:bg-green-500/10"
                title="الدرع (حماية من الأخطاء)"
             >
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                <span className="text-[8px] md:text-[10px] font-black">{powerups.shield}</span>
             </Button>
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("skip")}
                disabled={powerups.skip === 0 || state.answered}
                className="h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex flex-col gap-1 border-2 border-purple-500/30 hover:bg-purple-500/10"
                title="تخطي (إجابة تلقائية)"
             >
                <FastForward className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                <span className="text-[8px] md:text-[10px] font-black">{powerups.skip}</span>
             </Button>
          </div>
        </div>
        
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={state.selectedAnswer}
            answered={state.answered}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNextQuestion}
          />
        )}
      </div>
    </main>
  );
}
