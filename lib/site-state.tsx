"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { isTextInputLike } from "./utils";

interface SiteContextType {
  isAnatomyMode: boolean;
  toggleAnatomyMode: () => void;
  isTerminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  playSfx: (type: "click" | "zap" | "hum" | "error") => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [isAnatomyMode, setIsAnatomyMode] = useState(false);
  const [isTerminalOpen, setTerminalOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioEnabledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSfx = useCallback((type: "click" | "zap" | "hum" | "error") => {
    if (!audioEnabledRef.current) return;

    if (!audioContextRef.current) {
      const WebkitAudioContext = (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      const AudioCtx = window.AudioContext || WebkitAudioContext;
      if (!AudioCtx) return;
      audioContextRef.current = new AudioCtx();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case "zap":
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case "hum":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(60, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case "error":
        osc.type = "square";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  }, []);

  const toggleAnatomyMode = useCallback(() => {
    setIsAnatomyMode(prev => !prev);
    playSfx("click");
  }, [playSfx]);

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabledRef.current;
    audioEnabledRef.current = newState;
    setIsAudioEnabled(newState);
    if (newState) {
      setTimeout(() => playSfx("hum"), 100);
    }
  }, [playSfx]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const typing = isTextInputLike(document.activeElement);

      // Backtick to toggle terminal
      if (e.key === "`") {
        // Don't steal keystrokes from inputs unless the terminal is already open
        // (allowing a quick close even while focused inside the terminal input).
        if (!isTerminalOpen && typing) return;
        e.preventDefault();
        setTerminalOpen(prev => !prev);
        playSfx("click");
      }
      // Ctrl+Shift+X for Anatomy Mode
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x") {
        if (typing) return;
        e.preventDefault();
        toggleAnatomyMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAnatomyMode, playSfx, isTerminalOpen]);

  return (
    <SiteContext.Provider 
      value={{ 
        isAnatomyMode, 
        toggleAnatomyMode, 
        isTerminalOpen, 
        setTerminalOpen,
        isAudioEnabled,
        toggleAudio,
        playSfx
      }}
    >
      <div className={isAnatomyMode ? "anatomy-mode" : ""}>
        {children}
      </div>
      
      <style jsx global>{`
        .anatomy-mode [class*="FrankenContainer"],
        .anatomy-mode [class*="glass-modern"],
        .anatomy-mode section {
          outline: 1px solid rgba(34, 197, 94, 0.2) !important;
          outline-offset: 4px;
        }
        .anatomy-mode img, .anatomy-mode video {
          filter: grayscale(0.4) opacity(0.8);
          transition: filter 0.5s ease;
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .anatomy-mode::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
          z-index: 50; /* Lower z-index so it doesn't cover interactive elements */
          opacity: 0.5;
        }
        .anatomy-mode::after {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(34, 197, 94, 0.03) 50%,
            transparent 100%
          );
          background-size: 100% 12px;
          pointer-events: none;
          z-index: 51;
          animation: scanline 15s linear infinite;
        }
      `}</style>

    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}
