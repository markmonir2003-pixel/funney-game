// Storage utility for managing game progress and scores in LocalStorage

export interface GameScore {
  lesson: string;
  score: number;
  date: string;
  accuracy: number;
  xpEarned: number;
}

export interface LessonStats {
  bestScore: number;
  attempts: number;
}

export interface GameProgress {
  completedLessons: string[];
  totalXP: number;
  level: number;
  unlockedSkins: string[];
  selectedSkin: string;
  achievements: string[];
  powerups: {
    freeze: number;
    shield: number;
    skip: number;
  };
}

export interface StorageData {
  gameProgress: GameProgress;
  scores: GameScore[];
  lessonStats: Record<string, LessonStats>;
  leaderboard: { name: string; xp: number; avatar: string }[];
  mistakeTracker: Record<string, number>; // questionText -> mistake count
}

const STORAGE_KEY = "codeChallenge_gameData";

const DEFAULT_DATA: StorageData = {
  gameProgress: {
    completedLessons: [],
    totalXP: 0,
    level: 1,
    unlockedSkins: ["default"],
    selectedSkin: "default",
    achievements: [],
    powerups: {
      freeze: 3,
      shield: 2,
      skip: 1,
    },
  },
  scores: [],
  lessonStats: {},
  leaderboard: [
    { name: "Code Master", xp: 5000, avatar: "ninja" },
    { name: "Quiz Wiz", xp: 3500, avatar: "robot" },
    { name: "Fast Solver", xp: 2200, avatar: "rocket" },
    { name: "Student A", xp: 1500, avatar: "default" },
  ],
  mistakeTracker: {},
};

export function getStorageData(): StorageData {
  if (typeof window === "undefined") return DEFAULT_DATA;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_DATA;
    
    const parsed = JSON.parse(data);
    
    // Deep merge to ensure nested objects like gameProgress and powerups exist
    return {
      ...DEFAULT_DATA,
      ...parsed,
      gameProgress: {
        ...DEFAULT_DATA.gameProgress,
        ...(parsed.gameProgress || {}),
        powerups: {
          ...DEFAULT_DATA.gameProgress.powerups,
          ...(parsed.gameProgress?.powerups || {}),
        }
      },
      mistakeTracker: parsed.mistakeTracker || {}
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function trackMistake(questionText: string): void {
  const data = getStorageData();
  if (!data.mistakeTracker) data.mistakeTracker = {};
  data.mistakeTracker[questionText] = (data.mistakeTracker[questionText] || 0) + 1;
  saveStorageData(data);
}

export function saveStorageData(data: StorageData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn("Failed to save data to localStorage");
  }
}

export function addScore(score: GameScore): void {
  const data = getStorageData();
  data.scores.push(score);
  
  // Keep only last 20 scores
  if (data.scores.length > 20) {
    data.scores = data.scores.slice(-20);
  }
  
  saveStorageData(data);
}

export function updateLessonStats(lesson: string, score: number): void {
  const data = getStorageData();
  
  if (!data.lessonStats[lesson]) {
    data.lessonStats[lesson] = {
      bestScore: score,
      attempts: 1,
    };
  } else {
    data.lessonStats[lesson].bestScore = Math.max(
      data.lessonStats[lesson].bestScore,
      score
    );
    data.lessonStats[lesson].attempts += 1;
  }
  
  saveStorageData(data);
}

export function updateGameProgress(
  xpEarned: number,
  lesson: string,
  score: number
): void {
  const data = getStorageData();
  
  // Update total XP and level
  data.gameProgress.totalXP += xpEarned;
  data.gameProgress.level = Math.floor(data.gameProgress.totalXP / 1000) + 1;
  
  // Mark lesson as completed if score is passing (>= 70%)
  if (score >= 70 && !data.gameProgress.completedLessons.includes(lesson)) {
    data.gameProgress.completedLessons.push(lesson);
  }
  
  saveStorageData(data);
}

export function getRecentScores(count: number = 5): GameScore[] {
  const data = getStorageData();
  return data.scores.slice(-count).reverse();
}

export function getLessonBestScore(lesson: string): number {
  const data = getStorageData();
  return data.lessonStats[lesson]?.bestScore || 0;
}

export function getCompletedLessons(): string[] {
  return getStorageData().gameProgress.completedLessons;
}

export function getTotalXP(): number {
  return getStorageData().gameProgress.totalXP;
}

export function getUserLevel(): number {
  return getStorageData().gameProgress.level;
}

export function getOverallAccuracy(): number {
  const data = getStorageData();
  if (data.scores.length === 0) return 0;
  
  const totalAccuracy = data.scores.reduce((sum, score) => sum + score.accuracy, 0);
  return Math.round(totalAccuracy / data.scores.length);
}

export function unlockSkin(skinId: string, cost: number): boolean {
  const data = getStorageData();
  if (data.gameProgress.totalXP >= cost && !data.gameProgress.unlockedSkins.includes(skinId)) {
    data.gameProgress.totalXP -= cost;
    data.gameProgress.unlockedSkins.push(skinId);
    saveStorageData(data);
    return true;
  }
  return false;
}

export function selectSkin(skinId: string): void {
  const data = getStorageData();
  if (data.gameProgress.unlockedSkins.includes(skinId)) {
    data.gameProgress.selectedSkin = skinId;
    saveStorageData(data);
  }
}

export function getPowerups() {
  return getStorageData().gameProgress.powerups;
}

export function usePowerup(type: "freeze" | "shield" | "skip"): boolean {
  const data = getStorageData();
  if (data.gameProgress.powerups[type] > 0) {
    data.gameProgress.powerups[type] -= 1;
    saveStorageData(data);
    return true;
  }
  return false;
}

export function addPowerup(type: "freeze" | "shield" | "skip", count: number = 1): void {
  const data = getStorageData();
  data.gameProgress.powerups[type] += count;
  saveStorageData(data);
}

export function getLeaderboard() {
  const data = getStorageData();
  // Merge real user into leaderboard
  const userEntry = { name: "You", xp: data.gameProgress.totalXP, avatar: data.gameProgress.selectedSkin };
  const combined = [...data.leaderboard, userEntry].sort((a, b) => b.xp - a.xp);
  return combined;
}

export function checkAchievements(): string[] {
  const data = getStorageData();
  const newlyUnlocked: string[] = [];
  
  const achievements = [
    { id: "newbie", name: "First Steps", condition: data.gameProgress.totalXP >= 100 },
    { id: "expert", name: "Code Expert", condition: data.gameProgress.level >= 5 },
    { id: "legend", name: "Absolute Legend", condition: data.gameProgress.totalXP >= 10000 },
    { id: "streak_5", name: "On Fire!", condition: data.scores.some(s => s.accuracy === 100) },
    { id: "dedicated", name: "Dedicated Student", condition: data.scores.length >= 10 },
  ];

  achievements.forEach(ach => {
    if (ach.condition && !data.gameProgress.achievements.includes(ach.id)) {
      data.gameProgress.achievements.push(ach.id);
      newlyUnlocked.push(ach.name);
    }
  });

  if (newlyUnlocked.length > 0) saveStorageData(data);
  return newlyUnlocked;
}

export function getAchievements() {
  return getStorageData().gameProgress.achievements;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
