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
      return newSettings;
    });
  }, []);

  const speak = useCallback((text: string) => {
    if (!settings.textToSpeech || typeof window === "undefined") return;
    
    window.speechSynthesis.cancel();

    // Phonetic cleaning for better Arabic pronunciation without reading 'dots'
    let cleanText = text
      .replace(/([0-9]+)/g, " $1 ") // Add spaces around numbers
      .replace(/[?؟]/g, "؟ , , ") // Use commas for pauses instead of dots
      .replace(/[:]/g, ": , ") // Pause for colons
      .replace(/[-]/g, " - ") // Pause for dashes
      .replace(/\.\s*\.\s*\./g, " , ") // Replace triple dots with a comma pause
      .replace(/\./g, " , "); // Replace single dots with comma for better flow

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    
    // Priority: 1. Microsoft Neural Male 2. Google Male 3. Any Male Arabic 4. Fallback Arabic
    let selectedVoice = voices.find(v => 
      (v.lang.startsWith("ar") && (v.name.includes("Male") || v.name.includes("Hamza") || v.name.includes("Shakir")))
    );
    
    // If no specific male voice found, try the best neural/google voices regardless of gender
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        (v.name.includes("Neural") && v.lang.includes("ar")) || 
        (v.name.includes("Google") && v.lang.includes("ar"))
      );
    }
    
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("ar"));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = "ar-EG";
    }
    
    // Professional tuning for a clear male voice
    utterance.rate = 0.92; // Slightly faster but still very clear
    utterance.pitch = 0.95; // Lower pitch for a more natural male sound
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
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
