"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ChangelogEntry } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FrankenBolt } from "./franken-elements";

export default function Timeline({ items }: { items: ChangelogEntry[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative">
      <div className="absolute left-6 top-4 bottom-4 hidden w-px bg-gradient-to-b from-green-500/50 via-white/5 to-transparent md:block" />

      <ol className="space-y-8 pl-2 md:space-y-12 md:pl-0">
        {items.map((item, index) => {
          const isFirst = index === 0;

          return (
            <motion.li
              key={item.period}
              className="group relative md:pl-20"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={cn(
                "hidden md:flex absolute left-[8.5px] top-1 h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#020a02]/50 shadow-lg backdrop-blur-md z-10 transition-all duration-500",
                "group-hover:border-green-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
              )}>
                {isFirst ? (
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-700 transition-colors group-hover:bg-green-500/50" />
                )}
              </div>

              <div className={cn(
                "relative rounded-2xl border border-white/5 bg-black/20 p-6 md:p-8 transition-transform duration-300 motion-reduce:transition-none motion-safe:group-hover:-translate-y-1",
                isFirst && "border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/20 shadow-[0_0_30px_-10px_rgba(34,197,94,0.15)]"
              )}>
                {/* Visual flair - Bolts in the corners for a "stitched together" look */}
                <FrankenBolt className="absolute -left-1.5 -top-1.5 z-20 scale-75 opacity-40 transition-opacity group-hover:opacity-100" />
                <FrankenBolt className="absolute -right-1.5 -top-1.5 z-20 scale-75 opacity-40 transition-opacity group-hover:opacity-100" />
                <FrankenBolt className="absolute -left-1.5 -bottom-1.5 z-20 scale-75 opacity-40 transition-opacity group-hover:opacity-100" />
                <FrankenBolt className="absolute -right-1.5 -bottom-1.5 z-20 scale-75 opacity-40 transition-opacity group-hover:opacity-100" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className={cn(
                      "text-lg font-bold tracking-tight transition-colors",
                      isFirst ? "text-white" : "text-slate-200 group-hover:text-white"
                    )}>
                      {item.title}
                    </h3>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors group-hover:border-white/10 group-hover:text-slate-300">
                    {item.period}
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {item.items.map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300/90">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green-500/50" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
