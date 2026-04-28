// منطق اللعبة لحساب نقاط الخبرة (XP) والكومبو والأوسمة
import { Zap, Target, Brain } from "lucide-react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const BADGES: Record<string, Badge> = {
  perfectStart: {
    id: "perfectStart",
    name: "بداية مثالية",
    description: "أجب على أول 3 أسئلة بشكل صحيح",
    icon: "⭐",
  },
  comboKing: {
    id: "comboKing",
    name: "ملك الكومبو",
    description: "أجب على 5 أسئلة متتالية بشكل صحيح",
    icon: "🔥",
  },
  speedDemon: {
    id: "speedDemon",
    name: "شيطان السرعة",
    description: "أجب على السؤال في أقل من 5 ثوانٍ",
    icon: "⚡",
  },
  accuracyMaster: {
    id: "accuracyMaster",
    name: "سيد الدقة",
    description: "احصل على درجة 100% في الدرس",
    icon: "🎯",
  },
  marathon: {
    id: "marathon",
    name: "عداء الماراثون",
    description: "أكمل 5 دروس",
    icon: "🏃",
  },
  phenomenal: {
    id: "phenomenal",
    name: "ظاهرة",
    description: "احصل على درجة 90% أو أكثر في 3 دروس",
    icon: "🌟",
  },
};

export const BASE_XP_VALUES = {
  easy: 100,
  medium: 150,
  hard: 250,
};

export const COMBO_MULTIPLIERS = {
  3: 2, // مضاعفة مرتين عند 3 إجابات صحيحة
  5: 3, // مضاعفة 3 مرات عند 5 إجابات صحيحة
};

export function calculateXP(
  difficulty: "easy" | "medium" | "hard",
  comboStreak: number,
  timeRemaining: number
): number {
  const baseXP = BASE_XP_VALUES[difficulty];
  let multiplier = 1;

  // تطبيق مضاعف الكومبو
  if (comboStreak >= 5) {
    multiplier = COMBO_MULTIPLIERS[5];
  } else if (comboStreak >= 3) {
    multiplier = COMBO_MULTIPLIERS[3];
  }

  // مكافأة سرعة للإجابة السريعة (خلال أول 10 ثوانٍ)
  let speedBonus = 0;
  if (timeRemaining > 20) {
    speedBonus = 50; 
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
    return "أسطورة مطلقة! أنت الآن حاسوب خارق! 🤖✨";
  } else if (score >= 90) {
    return "كنت قريباً جداً من الكمال! آينشتاين يغار منك! 🧠🔥";
  } else if (score >= 80) {
    return "مهارات ملحمية! أنت تسحق الأسئلة مثل المحترفين! 🎮💪";
  } else if (score >= 70) {
    return "رائع! لقد نجحت! وقت رقصة النصر! 🕺🎉";
  } else if (score >= 50) {
    return "ليس سيئاً، لكنني رأيت حبة بطاطس تؤدي بشكل أفضل... أمزح فقط! حاول مرة أخرى! 🥔😜";
  } else {
    return "أوه! يبدو أن عقلك في استراحة قهوة. لنحاول مرة أخرى! ☕🤡";
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
  "الخوارزميات",
  "خرائط التدفق",
  "المتغيرات",
  "أنواع البيانات",
  "المدخلات والمخرجات",
  "الشروط",
  "الحلقات",
  "المعاملات",
  "اكتشاف الأخطاء",
];

export function getLessonColor(lessonName: string): string {
  const colors: Record<string, string> = {
    "الخوارزميات": "from-blue-500 to-cyan-500",
    "خرائط التدفق": "from-purple-500 to-pink-500",
    "المتغيرات": "from-green-500 to-emerald-500",
    "أنواع البيانات": "from-orange-500 to-red-500",
    "المدخلات والمخرجات": "from-yellow-500 to-orange-500",
    "الشروط": "from-pink-500 to-rose-500",
    "الحلقات": "from-indigo-500 to-purple-500",
    "المعاملات": "from-cyan-500 to-blue-500",
    "اكتشاف الأخطاء": "from-red-500 to-pink-500",
  };

  return colors[lessonName] || "from-gray-500 to-gray-600";
}
