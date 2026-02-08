"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Blocks,
  Bug,
  Clock,
  Cpu,
  Eye,
  FileText,
  GitCompare,
  Keyboard,
  Layers,
  Monitor,
  Package,
  Play,
  Rocket,
  Shield,
  Skull,
  Sparkles,
  Terminal,
  Twitter,
  Zap,
  Activity,
} from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { FrankenStitch } from "./franken-elements";

const sectionIcons = {
  barChart3: BarChart3,
  blocks: Blocks,
  bug: Bug,
  clock: Clock,
  cpu: Cpu,
  eye: Eye,
  fileText: FileText,
  gitCompare: GitCompare,
  keyboard: Keyboard,
  layers: Layers,
  monitor: Monitor,
  package: Package,
  play: Play,
  rocket: Rocket,
  shield: Shield,
  skull: Skull,
  sparkles: Sparkles,
  terminal: Terminal,
  twitter: Twitter,
  zap: Zap,
  activity: Activity,
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
  // Important: reduced-motion users must still see content (no "animate-in" gating).
  const reveal = prefersReducedMotion ? true : isIntersecting;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      data-section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative mx-auto max-w-7xl px-6 py-24 md:py-40 lg:py-56",
        className
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        
        {/* SIDEBAR HEADER (Stripe Style) */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-10">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            animate={reveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            {eyebrow && (
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-green-500/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-500/80">
                  {eyebrow}
                </span>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/5 border border-green-500/20 text-green-400">
                  {Icon ? <Icon className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                </div>
                <HeadingTag
                  id={headingId}
                  className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight"
                >
                  {title}
                </HeadingTag>
              </div>

              {kicker && (
                <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                  {kicker}
                </p>
              )}
            </div>
          </motion.div>

          {/* Decorative monster-tech elements */}
          <div className="hidden lg:block opacity-20 pointer-events-none">
             <FrankenStitch orientation="vertical" className="h-32" />
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="lg:col-span-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
            animate={reveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }
            }
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Kinetic Border at Bottom */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-green-500/10 to-transparent" />
    </section>
  );
}
