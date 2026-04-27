// Game logic utilities for XP, combo, and badge calculations

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const BADGES: Record<string, Badge> = {
  perfectStart: {
    id: "perfectStart",
    name: "Perfect Start",
    description: "Answer first 3 questions correctly",
    icon: "⭐",
  },
  comboKing: {
    id: "comboKing",
    name: "Combo King",
    description: "Get 5 correct answers in a row",
    icon: "🔥",
  },
  speedDemon: {
    id: "speedDemon",
    name: "Speed Demon",
    description: "Answer question in under 5 seconds",
    icon: "⚡",
  },
  accuracyMaster: {
    id: "accuracyMaster",
    name: "Accuracy Master",
    description: "Score 100% on a lesson",
    icon: "🎯",
  },
  marathon: {
    id: "marathon",
    name: "Marathon Runner",
    description: "Complete 5 lessons",
    icon: "🏃",
  },
  phenomenal: {
    id: "phenomenal",
    name: "Phenomenal",
    description: "Score 90% or higher on 3 lessons",
    icon: "🌟",
  },
};

export const BASE_XP_VALUES = {
  easy: 100,
  medium: 150,
  hard: 250,
};

export const COMBO_MULTIPLIERS = {
  3: 2, // 2x at 3 correct
  5: 3, // 3x at 5 correct
};

export function calculateXP(
  difficulty: "easy" | "medium" | "hard",
  comboStreak: number,
  timeRemaining: number
): number {
  const baseXP = BASE_XP_VALUES[difficulty];
  let multiplier = 1;

  // Apply combo multiplier
  if (comboStreak >= 5) {
    multiplier = COMBO_MULTIPLIERS[5];
  } else if (comboStreak >= 3) {
    multiplier = COMBO_MULTIPLIERS[3];
  }

  // Bonus XP for answering quickly (within 10 seconds)
  let speedBonus = 0;
  if (timeRemaining > 20) {
    speedBonus = 50; // Answered in under 10 seconds
  }

  return Math.floor(baseXP * multiplier + speedBonus);
}

export function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 75) return 2;
  return 1;
}

export function getMotivationalMessage(score: number): string {
  if (score === 100) {
    return "Absolute Legend! You're basically a supercomputer now! 🤖✨";
  } else if (score >= 90) {
    return "So close to perfection! Even Einstein is jealous! 🧠🔥";
  } else if (score >= 80) {
    return "Epic skills! You're crushing it like a pro gamer! 🎮💪";
  } else if (score >= 70) {
    return "Nice one! You passed! Time for a victory dance! 🕺🎉";
  } else if (score >= 50) {
    return "Not bad, but I've seen a potato do better... just kidding! Try again! 🥔😜";
  } else {
    return "Oops! Looks like your brain is on a coffee break. Let's try that again! ☕🤡";
  }
}

export function calculateAccuracy(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function calculateScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function checkBadges(
  score: number,
  comboStreak: number,
  completedLessons: number,
  highAccuracyCount: number
): Badge[] {
  const earnedBadges: Badge[] = [];

  if (comboStreak >= 3 && score < 100) {
    earnedBadges.push(BADGES.perfectStart);
  }

  if (comboStreak >= 5) {
    earnedBadges.push(BADGES.comboKing);
  }

  if (score === 100) {
    earnedBadges.push(BADGES.accuracyMaster);
  }

  if (completedLessons >= 5) {
    earnedBadges.push(BADGES.marathon);
  }

  if (highAccuracyCount >= 3) {
    earnedBadges.push(BADGES.phenomenal);
  }

  return earnedBadges;
}

export const LESSONS = [
  "Algorithms",
  "Flowcharts",
  "Variables",
  "Data Types",
  "Input/Output",
  "Conditions",
  "Loops",
  "Operators",
  "Error Detection",
];

export function getLessonColor(lessonName: string): string {
  const colors: Record<string, string> = {
    Algorithms: "from-blue-500 to-cyan-500",
    Flowcharts: "from-purple-500 to-pink-500",
    Variables: "from-green-500 to-emerald-500",
    "Data Types": "from-orange-500 to-red-500",
    "Input/Output": "from-yellow-500 to-orange-500",
    Conditions: "from-pink-500 to-rose-500",
    Loops: "from-indigo-500 to-purple-500",
    Operators: "from-cyan-500 to-blue-500",
    "Error Detection": "from-red-500 to-pink-500",
  };

  return colors[lessonName] || "from-gray-500 to-gray-600";
}
