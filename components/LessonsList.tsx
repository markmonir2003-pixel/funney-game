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
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

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

  const parentRef = useRef<HTMLDivElement>(null);
  const allLessons = [...customLessons, ...LESSONS.map(l => ({ id: l, name: l, questions: [], color: 'cyan' }))];

  const virtualizer = useVirtualizer({
    count: allLessons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 3,
  });

  return (
    <div className="space-y-12" ref={parentRef}>
      {/* Combined & Virtualized Lessons List */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-gradient-to-b from-primary to-cyan-500 rounded-full" />
          المهمات المتاحة ({allLessons.length})
        </h2>
        
        <div 
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const lesson = allLessons[virtualItem.index];
            const isCustom = 'color' in lesson && lesson.id !== lesson.name;
            
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: '1.5rem',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (virtualItem.index % 3) * 0.1 }}
                >
                  <LessonCard
                    name={lesson.name}
                    isCompleted={completedLessons.includes(lesson.name)}
                    bestScore={lessonStats[lesson.name]?.bestScore || 0}
                    attempts={lessonStats[lesson.name]?.attempts || 0}
                    isCustom={isCustom}
                    color={isCustom ? (lesson as any).color : undefined}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
