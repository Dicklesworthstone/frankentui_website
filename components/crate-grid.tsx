"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Package } from "lucide-react";
import { crates } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FrankenContainer } from "./franken-elements";

export default function CrateGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {crates.map((crate, i) => (
        <motion.div
          key={crate.name}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: (i % 6) * 0.05 }}
          viewport={{ once: true }}
        >
          <FrankenContainer
            withStitches={false}
            className={cn(
              "group h-full glass-modern transition-all duration-500 hover:bg-white/[0.03] hover:border-green-500/20 hover:-translate-y-1",
              crate.status === "reserved" && "opacity-50 grayscale contrast-75",
            )}
          >
            <div className="flex flex-col h-full p-6 lg:p-8">
              <div className="flex items-start justify-between mb-8">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    crate.status === "implemented"
                      ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : "bg-slate-800/50 text-slate-500 border-slate-700",
                  )}
                >
                  {crate.status === "implemented" ? (
                    <Package className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                    crate.status === "implemented"
                      ? "text-green-500 border-green-500/20 bg-green-500/5"
                      : "text-slate-500 border-slate-700 bg-slate-800/30",
                  )}
                >
                  {crate.status}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <h3 className="font-mono text-base font-black text-white group-hover:text-green-400 transition-colors tracking-tight">
                  {crate.name}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                  {crate.purpose}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500">
                  View Module
                </span>
                <ArrowRight className="h-3 w-3 text-green-500" />
              </div>
            </div>
          </FrankenContainer>
        </motion.div>
      ))}
    </div>
  );
}
