"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Blocks,
  Clock,
  Eye,
  GitCompare,
  Layers,
  Package,
  Play,
  Rocket,
  Shield,
  Skull,
  Sparkles,
  Terminal,
  Twitter,
  Zap,
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { FrankenStitch } from "./franken-elements";

const sectionIcons = {
  barChart3: BarChart3,
  blocks: Blocks,
  clock: Clock,
  eye: Eye,
  gitCompare: GitCompare,
  layers: Layers,
  package: Package,
  play: Play,
  rocket: Rocket,
  shield: Shield,
  skull: Skull,
  sparkles: Sparkles,
  terminal: Terminal,
  twitter: Twitter,
  zap: Zap,
} as const;

type SectionIcon = keyof typeof sectionIcons;

type Props = {
  id?: string;
  icon?: SectionIcon;
  eyebrow?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
  headingLevel?: 1 | 2;
};

export default function SectionShell({
  id,
  icon,
  eyebrow,
  title,
  kicker,
  children,
  className,
  headingLevel = 2,
}: Props) {
  const Icon = icon ? sectionIcons[icon] : undefined;
  const HeadingTag = `h${headingLevel}` as const;
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const headingId = id ? `${id}-heading` : undefined;
  const animateIn = isIntersecting && !prefersReducedMotion;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      data-section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative mx-auto max-w-7xl px-4 py-28 sm:px-6 md:py-36 lg:px-8 lg:py-44",
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: 1,
          y: animateIn ? 0 : 20
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
        style={{ opacity: 1 }}
      >
        <div className="mb-16 max-w-3xl md:mb-24">
          {eyebrow && (
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
              <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
                {eyebrow}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-5 md:items-center">
              {Icon && (
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-green-900/60 bg-gradient-to-br from-green-950/80 to-emerald-900/50 text-green-400 shadow-lg shadow-green-900/10 backdrop-blur-sm"
                  initial={false}
                  animate={animateIn ? {
                    boxShadow: "0 0 20px -5px rgba(34, 197, 94, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  } : {
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.2 }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              )}
              <HeadingTag
                id={headingId}
                className="font-bold tracking-tighter text-white"
                style={{ fontSize: "clamp(1.875rem, 5vw, 3.75rem)" }}
              >
                {title}
              </HeadingTag>
            </div>

            {kicker && (
              <p className="max-w-2xl text-lg font-normal leading-relaxed text-slate-400/90 md:ml-1 md:text-xl md:leading-relaxed">
                {kicker}
              </p>
            )}
          </div>
        </div>

        <motion.div
          className="relative"
          initial={false}
          animate={{
            opacity: 1,
            y: animateIn ? 0 : 12
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ opacity: 1 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Subtle stitched divider at the bottom of the section */}
      <div className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center overflow-hidden opacity-20 pointer-events-none">
        <FrankenStitch className="w-[120%] -rotate-1 scale-110" color="slate" />
      </div>
    </section>
  );
}
