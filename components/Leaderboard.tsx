"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { getLeaderboard } from "@/lib/storage";
import { useEffect, useState } from "react";

export function Leaderboard() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(getLeaderboard());
  }, []);

  return (
    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
      <div className="p-8 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-black uppercase tracking-tight">لوحة متصدري الساحة</h2>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {data.map((user, index) => {
            const isTop3 = index < 3;
            const isYou = user.name === "You";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                  isYou ? 'bg-primary/10 border-2 border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="w-10 flex items-center justify-center">
                  {index === 0 && <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />}
                  {index === 1 && <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />}
                  {index === 2 && <Medal className="w-6 h-6 text-orange-400 fill-orange-400" />}
                  {index > 2 && <span className="font-black text-muted-foreground">#{index + 1}</span>}
                </div>

                <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-xl shadow-inner">
                   {user.avatar === "ninja" ? "🥷" : user.avatar === "robot" ? "🤖" : user.avatar === "rocket" ? "🚀" : user.avatar === "king" ? "👑" : "👤"}
                </div>

                <div className="flex-1">
                  <p className={`font-black ${isYou ? 'text-primary' : 'text-foreground'}`}>
                    {user.name} {isYou && "(أنت)"}
                  </p>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                    محارب الكود
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black tabular-nums">{user.xp.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase">مجموع النقاط</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
