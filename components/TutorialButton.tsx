"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const TutorialModal = dynamic(() => import("@/components/TutorialModal").then(mod => mod.TutorialModal), {
  ssr: false,
});

export function TutorialButton() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <Button
          onClick={() => setShowTutorial(true)}
          className="rounded-full px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 font-black text-lg transition-all hover:scale-105"
        >
          <HelpCircle className="w-5 h-5 ml-2" />
          كيف تلعب؟ 🎮
        </Button>
      </motion.div>
    </>
  );
}
