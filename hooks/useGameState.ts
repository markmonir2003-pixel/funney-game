"use client";

import { useState, useCallback, useEffect } from "react";

export interface Question {
  id: number;
  lessonName: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  xpEarned: number;
  comboStreak: number;
  selectedAnswer: number | null;
  answered: boolean;
  timeRemaining: number;
  questions: Question[];
}

export function useGameState(questions: Question[]) {
  const [state, setState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    xpEarned: 0,
    comboStreak: 0,
    selectedAnswer: null,
    answered: false,
    timeRemaining: 30,
    questions,
  });

  // Sync state when questions are loaded
  useEffect(() => {
    setState(prev => ({ ...prev, questions }));
  }, [questions]);

  const isGameOver = questions.length > 0 && state.currentQuestionIndex >= questions.length;
  const currentQuestion = state.questions[state.currentQuestionIndex];

  const selectAnswer = useCallback((answerIndex: number) => {
    setState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
      answered: true,
    }));
  }, []);

  const nextQuestion = useCallback((xpEarned: number = 0) => {
    setState((prev) => {
      const isCorrect = prev.selectedAnswer === prev.questions[prev.currentQuestionIndex].correctAnswer;
      return {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        score: isCorrect ? prev.score + 1 : prev.score,
        xpEarned: prev.xpEarned + xpEarned,
        comboStreak: isCorrect ? prev.comboStreak + 1 : 0,
        selectedAnswer: null,
        answered: false,
        timeRemaining: 30,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      currentQuestionIndex: 0,
      score: 0,
      xpEarned: 0,
      comboStreak: 0,
      selectedAnswer: null,
      answered: false,
      timeRemaining: 30,
      questions,
    });
  }, [questions]);

  const decrementTime = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timeRemaining: Math.max(0, prev.timeRemaining - 1),
    }));
  }, []);

  return {
    state,
    selectAnswer,
    nextQuestion,
    resetGame,
    decrementTime,
    isGameOver,
    currentQuestion,
  };
}
