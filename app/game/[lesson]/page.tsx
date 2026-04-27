"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
import { getTeacherData, decodeLesson } from "@/lib/teacherStorage";
import { useSyncProgress } from "@/hooks/useSyncProgress";

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
  const lesson = decodeURIComponent(params.lesson as string);
  const { sync } = useSyncProgress();

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
    const lessonLower = lesson.toLowerCase();
    const data = getStorageData();
    setSelectedSkin(data.gameProgress?.selectedSkin || "default");
    
    if (data.gameProgress?.powerups) {
      setPowerups(data.gameProgress.powerups);
    }
    
    // 0. Check if data is in URL (Portable Quest)
    const encodedData = searchParams.get("q");
    if (encodedData) {
      const decodedLesson = decodeLesson(encodedData);
      if (decodedLesson && decodedLesson.questions.length > 0) {
        setQuestions(decodedLesson.questions as any);
        setLoading(false);
        return;
      }
    }

    // 1. Check if it's a custom teacher lesson (Local Storage)
    const teacherLessons = getTeacherData();
    const customLesson = teacherLessons.find(l => l.name.toLowerCase() === lessonLower);

    if (customLesson && customLesson.questions.length > 0) {
      setQuestions(customLesson.questions as any);
      setLoading(false);
    } else {
      // 2. Fallback to default questions
      fetch("/data/questions.json")
        .then((res) => res.json())
        .then((data: Question[]) => {
          const filteredQuestions = data.filter(
            (q) => q.lessonName.toLowerCase() === lessonLower
          );
          setQuestions(filteredQuestions);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [lesson]);

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
         alert("Shield activated! Safety for this question.");
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

  const handleGameEnd = () => {
    const accuracy = calculateAccuracy(
      state.score,
      state.questions.length
    );
    const score = calculateScore(state.score, state.questions.length);

    addScore({
      lesson,
      score,
      date: new Date().toISOString().split("T")[0],
      accuracy,
      xpEarned: state.xpEarned,
    });

    updateLessonStats(lesson, score);
    updateGameProgress(state.xpEarned, lesson, score);

    // Sync to cloud if signed in
    sync();

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
          <p className="text-xl text-muted-foreground">Loading lesson...</p>
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
            Oops! This Quest is Empty
          </p>
          <p className="text-muted-foreground max-w-sm mx-auto">
            It looks like this lesson is waiting for some funny questions. Maybe the teacher is still drinking their coffee! ☕
          </p>
          <Button
            onClick={() => router.push("/lessons")}
            className="bg-primary hover:opacity-90 text-primary-foreground font-black py-6 px-8 rounded-2xl shadow-xl shadow-primary/20"
          >
            Go Back to Arena
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
          lesson={lesson}
          onRetry={handleRetry}
          onBackToLessons={handleBackToLessons}
        />
      </main>
    );
  }

  if (isGameOver && !gameEnded) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onAnimationComplete={handleGameEnd}
        >
          <div className="text-center">
            <p className="text-muted-foreground">Calculating results...</p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
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
            />
          </div>

          {/* Power-ups UI */}
          <div className="flex flex-row md:flex-col gap-3">
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("freeze")}
                disabled={powerups.freeze === 0 || state.answered}
                className="h-16 w-16 rounded-2xl flex flex-col gap-1 border-2 border-blue-500/30 hover:bg-blue-500/10"
                title="Freeze Time (+10s)"
             >
                <Timer className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-black">{powerups.freeze}</span>
             </Button>
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("shield")}
                disabled={powerups.shield === 0 || state.answered}
                className="h-16 w-16 rounded-2xl flex flex-col gap-1 border-2 border-green-500/30 hover:bg-green-500/10"
                title="Shield (Mistake Protection)"
             >
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-black">{powerups.shield}</span>
             </Button>
             <Button 
                variant="outline" 
                onClick={() => handleUsePowerup("skip")}
                disabled={powerups.skip === 0 || state.answered}
                className="h-16 w-16 rounded-2xl flex flex-col gap-1 border-2 border-purple-500/30 hover:bg-purple-500/10"
                title="Skip (Auto-correct)"
             >
                <FastForward className="w-5 h-5 text-purple-500" />
                <span className="text-[10px] font-black">{powerups.skip}</span>
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
