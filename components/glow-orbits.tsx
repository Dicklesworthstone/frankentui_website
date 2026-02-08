"use client";

import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { motion, useTransform, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

export default function GlowOrbits() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ref: observerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    triggerOnce: false,
  });
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  const parallaxX = useTransform(springX, (val) => {
    if (typeof window === "undefined") return 0;
    return (val / window.innerWidth - 0.5) * -40;
  });
  const parallaxY = useTransform(springY, (val) => {
    if (typeof window === "undefined") return 0;
    return (val / window.innerHeight - 0.5) * -40;
  });

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (!isIntersecting) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isIntersecting, prefersReducedMotion]);

  useEffect(() => {
    if (!rootRef.current) return;
    if (prefersReducedMotion) return;
    if (!isIntersecting) return;

    const rings = rootRef.current.querySelectorAll<HTMLElement>(".glow-ring");
    if (rings.length === 0) return;

    const animations: Animation[] = [];

    rings.forEach((ring, i) => {
      const animation = ring.animate(
        [
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(180deg) scale(1.06)" },
          { transform: "rotate(360deg) scale(1)" },
        ],
        {
          duration: 48000 + i * 4000,
          iterations: Infinity,
          easing: "linear",
        }
      );
      animations.push(animation);
    });

    return () => animations.forEach(a => a.cancel());
  }, [prefersReducedMotion, isIntersecting]);

  return (
    <motion.div
      ref={(node) => {
        rootRef.current = node as HTMLDivElement;
        observerRef.current = node as HTMLDivElement;
      }}
      style={prefersReducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="glow-ring absolute -top-32 -left-10 h-96 w-96 md:h-72 md:w-72 rounded-[999px] bg-gradient-to-tr from-green-500/40 via-emerald-500/20 to-transparent blur-3xl" />
      <div className="glow-ring absolute -bottom-40 -right-4 h-[500px] w-[500px] md:h-80 md:w-80 rounded-[999px] bg-gradient-to-tr from-lime-400/40 via-green-500/20 to-transparent blur-3xl" />
      <div className="glow-ring absolute top-1/2 left-1/2 h-[600px] w-[600px] md:h-96 md:w-96 -translate-x-1/2 -translate-y-1/2 rounded-[999px] bg-gradient-to-tr from-emerald-500/35 via-green-500/15 to-transparent blur-3xl" />
    </motion.div>
  );
}
