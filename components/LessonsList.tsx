"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LessonCard } from "@/components/LessonCard";
import { LESSONS } from "@/lib/gameLogic";
import { getTeacherData, CustomLesson } from "@/lib/teacherStorage";
import {
  getCompletedLessons,
  getLessonBestScore,
  getTotalXP,
} from "@/lib/storage";

interface LessonsListProps {
  onStatsUpdate: (stats: { totalXP: number; completedCount: number; totalCount: number }) => void;
}

export function LessonsList({ onStatsUpdate }: LessonsListProps) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [lessonStats, setLessonStats] = useState<Record<string, { bestScore: number; attempts: number }>>({});

  useEffect(() => {
    const completed = getCompletedLessons();
    const teacherLessons = getTeacherData();
    const totalXP = getTotalXP();
    
    setCompletedLessons(completed);
    setCustomLessons(teacherLessons);

    const stats: Record<string, { bestScore: number; attempts: number }> = {};
    const allLessonNames = [...LESSONS, ...teacherLessons.map(l => l.name)];
    
    allLessonNames.forEach((lesson) => {
      const bestScore = getLessonBestScore(lesson);
      stats[lesson] = {
        bestScore,
        attempts: bestScore > 0 ? 1 : 0,
      };
    });
    setLessonStats(stats);
    
    onStatsUpdate({
      totalXP,
      completedCount: completed.length,
      totalCount: LESSONS.length + teacherLessons.length
    });
  }, [onStatsUpdate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="space-y-12">
      {/* Custom Lessons Section */}
      {customLessons.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-primary rounded-full" />
            دروس المعلم الخاصة
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {customLessons.map((lesson) => (
              <motion.div key={lesson.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <LessonCard
                  name={lesson.name}
                  isCompleted={completedLessons.includes(lesson.name)}
                  bestScore={lessonStats[lesson.name]?.bestScore || 0}
                  attempts={lessonStats[lesson.name]?.attempts || 0}
                  isCustom
                  color={lesson.color}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Default Lessons Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-cyan-500 rounded-full" />
          المهمات القياسية
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {LESSONS.map((lesson) => (
            <motion.div key={lesson} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <LessonCard
                name={lesson}
                isCompleted={completedLessons.includes(lesson)}
                bestScore={lessonStats[lesson]?.bestScore || 0}
                attempts={lessonStats[lesson]?.attempts || 0}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
