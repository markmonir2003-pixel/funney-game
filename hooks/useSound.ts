"use client";

import { useCallback, useRef } from "react";

const SOUNDS = {
  correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  wrong: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3",
  powerup: "https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3",
};

export function useSound() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const play = useCallback((soundName: keyof typeof SOUNDS) => {
    if (typeof window === "undefined") return;

    if (!audioRefs.current[soundName]) {
      audioRefs.current[soundName] = new Audio(SOUNDS[soundName]);
    }

    const audio = audioRefs.current[soundName];
    audio.currentTime = 0;
    audio.play().catch(() => {
        // Ignore errors if sound can't play (e.g. user hasn't interacted yet)
    });
  }, []);

  return { play };
}
