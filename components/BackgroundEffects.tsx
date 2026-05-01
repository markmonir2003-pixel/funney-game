"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const generatedStars = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5
    }));
    setStars(generatedStars);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dynamic Glows */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]"
        animate={{
          x: [0, -50, 0],
          y: [0, -100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Floating Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-500/20"
          initial={{ 
            top: star.top, 
            left: star.left,
            scale: star.scale
          }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: star.duration, 
            repeat: Infinity,
            delay: star.delay
          }}
        >
          <Star className="w-2 h-2 fill-current" />
        </motion.div>
      ))}
    </div>
  );
}
