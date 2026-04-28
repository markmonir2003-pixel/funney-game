"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getLessonColor } from "@/lib/gameLogic";
import { CheckCircle2, Play, Trophy, Sparkles } from "lucide-react";

interface LessonCardProps {
  name: string;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
  isCustom?: boolean;
  color?: string;
}

export function LessonCard({
  name,
  isCompleted,
  bestScore,
  attempts,
  isCustom,
  color,
}: LessonCardProps) {
  const gradientColor = color || getLessonColor(name);

  return (
    <Link href={`/game/${encodeURIComponent(name)}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative h-full bg-card backdrop-blur-sm border border-border rounded-3xl overflow-hidden hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Top Gradient Bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${gradientColor}`} />

        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientColor} shadow-lg shadow-black/20 group-hover:rotate-6 transition-transform duration-300`}>
              {isCustom ? <Sparkles className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </div>
            {isCompleted && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500/10 p-1.5 rounded-full"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </motion.div>
            )}
          </div>

          <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
            {name}
          </h3>
          
          <div className="flex-1">
            {isCustom && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md">
                من إنشاء المعلم
              </span>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${bestScore > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <span className="text-sm font-bold text-foreground">
                {bestScore}% <span className="text-muted-foreground font-medium">الأفضل</span>
              </span>
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
              {attempts} محاولات
            </div>
          </div>
        </div>

        {/* Hover Effect Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
      </motion.div>
    </Link>
  );
}
