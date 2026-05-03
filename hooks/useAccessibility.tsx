"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type AccessibilitySettings = {
  textToSpeech: boolean;
  highContrast: boolean;
  visualCues: boolean;
  fontSize: "normal" | "large" | "extra-large";
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  speak: (text: string) => void;
}

const STORAGE_KEY = "funnyGame_accessibility";

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ─── Preload voices globally (once per session) ──────────────────────────────
// Chrome loads voices async — we listen once and cache them, so speak() never
// hits an empty array again.
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReady = false;

function initVoiceCache() {
  if (typeof window === "undefined") return;
  const load = () => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) {
      cachedVoices = v;
      voicesReady = true;
    }
  };
  load(); // try immediately (Firefox / Safari return sync)
  window.speechSynthesis.addEventListener("voiceschanged", load); // Chrome fires async
}

if (typeof window !== "undefined") {
  initVoiceCache();
}
// ─────────────────────────────────────────────────────────────────────────────

/** Pick the best voice from a priority list */
function pickVoice(langPrefix: string, priorityNames: string[]): SpeechSynthesisVoice | undefined {
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  for (const name of priorityNames) {
    const match = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes(name));
    if (match) return match;
  }
  // Fallback: neural / online first, then any
  return (
    voices.find(v => v.lang.startsWith(langPrefix) && (v.name.toLowerCase().includes("neural") || v.name.toLowerCase().includes("online"))) ||
    voices.find(v => v.lang.startsWith(langPrefix))
  );
}

const ARABIC_VOICE_PRIORITY = [
  "Microsoft Hamed Online",
  "Microsoft Salma Online",
  "Microsoft Shakir Online",
  "Microsoft Zariyah Online",
  "Google العربية",
  "Maged",
  "Tarik",
  "Laila",
];

const ENGLISH_VOICE_PRIORITY = [
  "Microsoft Aria Online",
  "Microsoft Guy Online",
  "Google US English",
  "Samantha",
  "Alex",
];

// ─────────────────────────────────────────────────────────────────────────────

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textToSpeech: false,
    highContrast: false,
    visualCues: false,
    fontSize: "normal",
  });

  const currentSpeechId = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load accessibility settings", e);
      }
    }
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      if (key === "textToSpeech" && !value && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      return newSettings;
    });
  }, []);

  /**
   * speak() — bilingual TTS with zero gap between Arabic / English segments.
   *
   * Strategy:
   * 1. Cancel any ongoing speech immediately.
   * 2. Split text into language segments.
   * 3. Build utterance objects for each segment with the correct voice.
   * 4. Chain them via `onend` callbacks so the next one starts the instant
   *    the previous one finishes — no browser-queue timing surprises.
   */
  const speak = useCallback((text: string) => {
    if (!settings.textToSpeech || typeof window === "undefined") return;

    window.speechSynthesis.cancel();

    // Bump the speech ID so any stale onend from a previous call is ignored
    currentSpeechId.current += 1;
    const mySpeechId = currentSpeechId.current;

    const arabicVoice = pickVoice("ar", ARABIC_VOICE_PRIORITY);
    const englishVoice =
      pickVoice("en-US", ENGLISH_VOICE_PRIORITY) ||
      pickVoice("en", ENGLISH_VOICE_PRIORITY);

    // Split text into Arabic / English chunks
    const rawChunks = text
      .split(/([a-zA-Z][a-zA-Z0-9 _.,()[\]{}<>=:;'"\\-]*[a-zA-Z0-9_)]|[a-zA-Z])/g)
      .filter(Boolean);

    // Build utterance list
    const utterances: SpeechSynthesisUtterance[] = [];

    for (const chunk of rawChunks) {
      let clean = chunk.trim();
      if (!clean || clean === "," || clean === "،") continue;

      const isEnglish = /[a-zA-Z]/.test(clean);

      if (!isEnglish) {
        // Improve Arabic prosody with micro-pauses
        clean = clean
          .replace(/([0-9]+)/g, " $1 ")
          .replace(/[?؟]/g, "؟، ")
          .replace(/[:]/g, ": ")
          .replace(/[-]/g, " - ")
          .replace(/\.\s*\.\s*\./g, "، ");
      }

      const utt = new SpeechSynthesisUtterance(clean);
      utt.volume = 1.0;

      if (isEnglish) {
        utt.lang = englishVoice?.lang ?? "en-US";
        if (englishVoice) utt.voice = englishVoice;
        utt.rate = 1.1;
        utt.pitch = 1.0;
      } else {
        utt.lang = arabicVoice?.lang ?? "ar-SA";
        if (arabicVoice) utt.voice = arabicVoice;
        utt.rate = 1.25;
        utt.pitch = 0.98;
      }

      utterances.push(utt);
    }

    if (utterances.length === 0) return;

    // ── Chain utterances via onend so each starts immediately after the previous ──
    // This removes any browser-imposed gap between language switches.
    const speakNext = (index: number) => {
      if (currentSpeechId.current !== mySpeechId) return; // cancelled
      if (index >= utterances.length) return;

      const utt = utterances[index];
      utt.onend = () => speakNext(index + 1);
      utt.onerror = () => speakNext(index + 1); // skip on error, don't stall
      window.speechSynthesis.speak(utt);
    };

    speakNext(0);
  }, [settings.textToSpeech]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
