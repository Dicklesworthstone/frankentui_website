"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence, useTransform } from "framer-motion";

function DataDebris({ x, y }: { x: any; y: any }) {
  const particles = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      char: Math.random() > 0.5 ? (Math.random() * 16 | 0).toString(16) : Math.random() > 0.5 ? "0" : "1",
      offsetX: (Math.random() - 0.5) * 40,
      offsetY: (Math.random() - 0.5) * 40,
      duration: 1 + Math.random() * 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-[8px] font-mono text-green-500/40 select-none"
          style={{
            x,
            y,
            left: p.offsetX,
            top: p.offsetY,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -20, -40],
            x: [0, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.char}
        </motion.div>
      ))}
    </div>
  );
}

export default function CustomCursor() {
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isOverFlashlightSection, setIsOverFlashlightSection] = useState(false);
  const [isTechnicalArea, setIsTechnicalArea] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Magnetic effect state
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
  const [isMagnetic, setIsMagnetic] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      if (!target) return;

      const isClickable = 
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        !!target.closest("button") ||
        !!target.closest("a");
        
      setIsPointer(isClickable);

      // Check for technical areas (code, terminal, etc.)
      const isTech = !!target.closest("pre") || !!target.closest("code") || !!target.closest("[data-technical='true']");
      setIsTechnicalArea(isTech);

      // Check for flashlight sections
      const isFlashlight = !!target.closest("[data-flashlight='true']") && !target.closest("header");
      setIsOverFlashlightSection(isFlashlight);

      // Magnetic effect logic
      const magneticElement = target.closest("[data-magnetic='true']");
      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        
        if (distance < 60) {
          setIsMagnetic(true);
          setMagneticPos({ x: centerX, y: centerY });
          return;
        }
      }
      setIsMagnetic(false);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
        <AnimatePresence>
          {isVisible && (
            <>
              {/* Flashlight Effect */}
              {isOverFlashlightSection && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute h-[600px] w-[600px] rounded-full"
                  style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                    background: "radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.9) 70%)",
                    boxShadow: "0 0 0 3000px rgba(0, 0, 0, 0.9)",
                  }}
                />
              )}

              {/* Data Debris Trail */}
              {isTechnicalArea && <DataDebris x={cursorX} y={cursorY} />}

              {/* Outer Ring */}
              <motion.div
                className="absolute left-0 top-0 h-10 w-10 rounded-full border border-green-500/40 mix-blend-screen"
                style={{
                  x: isMagnetic ? magneticPos.x : cursorX,
                  y: isMagnetic ? magneticPos.y : cursorY,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                animate={{
                  scale: isPointer ? 1.4 : isClicking ? 0.7 : 1,
                  rotate: isClicking ? 45 : 0,
                  borderRadius: isClicking ? "20%" : "50%",
                  borderColor: isPointer ? "rgba(74, 222, 128, 0.8)" : "rgba(74, 222, 128, 0.4)",
                  borderWidth: isPointer ? 2 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  mass: 0.5
                }}
              >
                 {/* Click Glitch Lines */}
                 <AnimatePresence>
                   {isClicking && (
                     <motion.div
                       initial={{ opacity: 0, scale: 0.5 }}
                       animate={{ opacity: 1, scale: 1.5 }}
                       exit={{ opacity: 0 }}
                       className="absolute inset-[-10px] border border-red-500/50 rounded-full mix-blend-overlay"
                     />
                   )}
                 </AnimatePresence>
              </motion.div>

              {/* Inner Dot */}
              <motion.div
                className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                style={{
                  x: mouseX,
                  y: mouseY,
                  translateX: "-50%",
                  translateY: "-50%",
                }}
                animate={{
                  scale: isClicking ? 3 : 1,
                  backgroundColor: isClicking ? "#ef4444" : "#4ade80",
                }}
              />

              {/* Crosshair lines for pointers */}
              {isPointer && !isMagnetic && (
                <motion.div
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  className="absolute left-0 top-0 pointer-events-none"
                  style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                  }}
                >
                  <div className="absolute top-[-15px] left-1/2 h-[8px] w-[1px] bg-green-500/60 -translate-x-1/2" />
                  <div className="absolute bottom-[-15px] left-1/2 h-[8px] w-[1px] bg-green-500/60 -translate-x-1/2" />
                  <div className="absolute left-[-15px] top-1/2 w-[8px] h-[1px] bg-green-500/60 -translate-y-1/2" />
                  <div className="absolute right-[-15px] top-1/2 w-[8px] h-[1px] bg-green-500/60 -translate-y-1/2" />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          body {
            cursor: none !important;
          }
          a, button, [role="button"], input, textarea, select {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}