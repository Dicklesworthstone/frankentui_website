"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { Stat } from "@/lib/content";
import { AnimatedNumber } from "@/components/animated-number";
import { FrankenContainer } from "./franken-elements";

function parseStatValue(value: string): {
  number: number;
  suffix: string;
  isAnimatable: boolean;
} {
  const match = value.match(/^([0-9,.]+)(K|M|B)?(\+)?$/i);

  if (!match) {
    return { number: 0, suffix: value, isAnimatable: false };
  }

  const [, numStr, magnitude, plus] = match;
  const num = parseFloat(numStr.replace(/,/g, ""));
  const suffix = `${magnitude || ""}${plus || ""}`;

  return { number: num, suffix, isAnimatable: true };
}

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDListElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const parsedStats = useMemo(
    () => stats.map((stat) => ({ stat, parsed: parseStatValue(stat.value) })),
    [stats]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      const hydrationId = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(hydrationId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <FrankenContainer className="overflow-hidden">
      <dl
        ref={containerRef}
        className="grid gap-px overflow-hidden text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4"
      >
        {parsedStats.map(({ stat, parsed }, index) => (
          <div
            key={stat.label}
            className="group relative bg-[#020a02]/60 px-6 py-8 backdrop-blur transition-colors hover:bg-[#020a02]/40"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-x-0 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-green-400 via-lime-400 to-green-400 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />

            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-green-400/70">
              {stat.label}
            </dt>
            <dd className="mt-3 text-3xl font-bold tracking-tight text-slate-100 transition-[filter] duration-500 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.3)] sm:text-4xl">
              {parsed.isAnimatable ? (
                <AnimatedNumber
                  value={parsed.number}
                  suffix={parsed.suffix}
                  duration={1800 + index * 200}
                  isVisible={isVisible}
                />
              ) : (
                stat.value
              )}
            </dd>
            {stat.helper && (
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400/80">
                {stat.helper}
              </p>
            )}
          </div>
        ))}
      </dl>
    </FrankenContainer>
  );
}
