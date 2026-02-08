"use client";

import { Package, Clock } from "lucide-react";
import { crates } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FrankenContainer } from "./franken-elements";

export default function CrateGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {crates.map((crate) => (
        <FrankenContainer
          key={crate.name}
          withStitches={false}
          className={cn(
            "group h-full bg-black/30 transition-all hover:border-green-500/20 hover:bg-black/40",
            crate.status === "reserved" && "opacity-60"
          )}
        >
          <div className="flex items-start gap-4 p-4">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors",
              crate.status === "implemented"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-slate-800 text-slate-500 border-slate-700"
            )}>
              {crate.status === "implemented" ? (
                <Package className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                {crate.name}
              </h3>
              <p className="mt-1 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{crate.purpose}</p>
              <span className={cn(
                "mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border",
                crate.status === "implemented"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              )}>
                {crate.status}
              </span>
            </div>
          </div>
        </FrankenContainer>
      ))}
    </div>
  );
}
