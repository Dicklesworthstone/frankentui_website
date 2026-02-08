"use client";

import { comparisonData } from "@/lib/content";
import { cn } from "@/lib/utils";
import { FrankenContainer } from "./franken-elements";

function StatusCell({ value }: { value: string }) {
  const isPositive = ["First-class", "Kernel-level", "Enforced", "TerminalSession", "Built-in"].includes(value);
  const isPartial = ["App-specific", "Yes"].includes(value);
  const isNegative = ["Manual", "No"].includes(value);

  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-3 text-sm font-medium",
        isPositive && "text-green-400",
        isPartial && "text-yellow-400/80",
        isNegative && "text-slate-500"
      )}
    >
      {isPositive && <span className="mr-1.5">&#10003;</span>}
      {isNegative && <span className="mr-1.5">&#10005;</span>}
      {isPartial && <span className="mr-1.5">&#9888;</span>}
      {value}
    </td>
  );
}

export default function ComparisonTable() {
  return (
    <FrankenContainer className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Feature</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-green-400">FrankenTUI</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Ratatui</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">tui-rs</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Raw crossterm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {comparisonData.map((row) => (
              <tr key={row.feature} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-sm font-medium text-slate-300">{row.feature}</td>
                <StatusCell value={row.frankentui} />
                <StatusCell value={row.ratatui} />
                <StatusCell value={row.tuiRs} />
                <StatusCell value={row.rawCrossterm} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FrankenContainer>
  );
}
