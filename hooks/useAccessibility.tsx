"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    textToSpeech: false,
    highContrast: false,
    visualCues: false,
    fontSize: "normal",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load accessibility settings", e);
      }
    }
    // Pre-load voices for Chrome
    window.speechSynthesis.getVoices();
  }, []);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      
      // Stop speaking immediately if textToSpeech is turned off
      if (key === "textToSpeech" && !value && typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      
      return newSettings;
    });
  }, []);

  const currentSpeechId = React.useRef(0);

  const speak = useCallback((text: string) => {
    if (!settings.textToSpeech || typeof window === "undefined") return;
    
    window.speechSynthesis.cancel();
    
    currentSpeechId.current += 1;
    const mySpeechId = currentSpeechId.current;

    const voices = window.speechSynthesis.getVoices();

    // Array of the absolute best Arabic voices available on browsers (Edge/Chrome/Mac)
    const premiumArabicVoices = [
      "Microsoft Hamed Online", // Edge/Windows Best Male (Saudi)
      "Microsoft Salma Online", // Edge/Windows Best Female (Egypt)
      "Microsoft Shakir Online", // Edge/Windows Best Male (Egypt)
      "Microsoft Zariyah Online", // Edge/Windows Best Female (UAE)
      "Google العربية", // Chrome Best
      "Maged", // Mac Best Male
      "Tarik", // Mac Alternate Male
      "Laila", // Mac Best Female
    ];
    
    let arabicVoice;
    for (const name of premiumArabicVoices) {
      arabicVoice = voices.find(v => v.lang.startsWith("ar") && v.name.includes(name));
      if (arabicVoice) break;
    }

    if (!arabicVoice) {
      arabicVoice = voices.find(v => 
        v.lang.startsWith("ar") && (v.name.toLowerCase().includes("neural") || v.name.toLowerCase().includes("online"))
      ) || voices.find(v => v.lang.startsWith("ar"));
    }

    const premiumEnglishVoices = [
      "Microsoft Aria Online",
      "Microsoft Guy Online", 
      "Google US English",
      "Samantha",
      "Alex"
    ];

    let englishVoice;
    for (const name of premiumEnglishVoices) {
      englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes(name));
      if (englishVoice) break;
    }

    if (!englishVoice) {
      englishVoice = voices.find(v => 
        v.lang.startsWith("en") && (v.name.toLowerCase().includes("neural") || v.name.toLowerCase().includes("online"))
      ) || voices.find(v => v.lang.startsWith("en-US")) || voices.find(v => v.lang.startsWith("en"));
    }

    // Split text into Arabic and English segments based on English letters
    const chunks = text.split(/([a-zA-Z][a-zA-Z0-9_.,()[\]{}<>=:;'"\s]*[a-zA-Z0-9_)]|[a-zA-Z])/g).filter(Boolean);

    chunks.forEach(chunk => {
      let cleanChunk = chunk.trim();
      if (!cleanChunk || cleanChunk === "," || cleanChunk === "،") {
        return;
      }

      const isEnglish = /[a-zA-Z]/.test(cleanChunk);
      
      if (!isEnglish) {
        cleanChunk = cleanChunk
          .replace(/([0-9]+)/g, " $1 ")
          .replace(/[?؟]/g, "؟ , , ")
          .replace(/[:]/g, ": , ")
          .replace(/[-]/g, " - ")
          .replace(/\.\s*\.\s*\./g, " , ");
      }

      const utterance = new SpeechSynthesisUtterance(cleanChunk);

      if (isEnglish) {
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = englishVoice.lang;
        } else {
          utterance.lang = "en-US";
        }
        utterance.rate = 1.15; // Normal English reading
        utterance.pitch = 1.0;
      } else {
        if (arabicVoice) {
          utterance.voice = arabicVoice;
          utterance.lang = arabicVoice.lang;
        } else {
          utterance.lang = "ar-SA";
        }
        utterance.rate = 1.30; // Faster Arabic reading
        utterance.pitch = 0.98;
      }
      
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    });
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
