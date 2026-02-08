"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSite } from "@/lib/site-state";
import { useRouter } from "next/navigation";
import { Terminal as TerminalIcon, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrankenBolt, NeuralPulse } from "./franken-elements";
import FrankenGlitch from "./franken-glitch";

interface CommandResult {
  command: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

export default function SiteTerminal() {
  const { isTerminalOpen, setTerminalOpen, toggleAnatomyMode, toggleAudio, isAudioEnabled, playSfx } = useSite();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandResult[]>([
    { command: "system", output: "FrankenTUI Shell v1.0.4. Type 'help' for commands." }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const processCommand = (cmd: string) => {
    const parts = cmd.toLowerCase().trim().split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    let output: string | React.ReactNode = "";
    let isError = false;
    playSfx("click");

    switch (command) {
      case "help":
        output = (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
            <div className="text-green-500">help</div><div>Show this list</div>
            <div className="text-green-500">goto [slug]</div><div>Navigate (showcase, architecture, beads, etc)</div>
            <div className="text-green-500">anatomy</div><div>Toggle X-Ray Anatomy mode</div>
            <div className="text-green-500">audio</div><div>Toggle Galvanic Audio</div>
            <div className="text-green-500">clear</div><div>Clear history</div>
            <div className="text-green-500">exit</div><div>Close terminal</div>
            <div className="text-green-500">stats</div><div>Show monster vital signs</div>
          </div>
        );
        break;
      case "goto":
        if (args[0]) {
          const validSlugs = ["showcase", "architecture", "beads", "war-stories", "getting-started", "how-it-was-built"];
          if (validSlugs.includes(args[0])) {
            router.push(`/${args[0]}`);
            output = `Navigating to /${args[0]}...`;
            setTimeout(() => setTerminalOpen(false), 500);
          } else {
            output = `Error: Unknown destination '${args[0]}'. Valid targets: ${validSlugs.join(", ")}`;
            isError = true;
            playSfx("error");
          }
        } else {
          output = "Error: Missing target slug.";
          isError = true;
          playSfx("error");
        }
        break;
      case "anatomy":
        toggleAnatomyMode();
        output = "Anatomy Mode toggled. Visual sensors recalibrated.";
        break;
      case "audio":
        toggleAudio();
        output = `Audio transducers updated. Use 'stats' to verify.`;
        break;
      case "clear":
        setHistory([]);
        return;
      case "exit":
        setTerminalOpen(false);
        return;
      case "stats":
        output = (
          <div className="space-y-1 text-green-400 font-mono">
            <div>CORE_TEMP: 34.2°C [STABLE]</div>
            <div>MEMORY_USAGE: 128MB / 16GB</div>
            <div>SYNAPTIC_LATENCY: 1.2ms</div>
            <div>UPTIME: 5d 14h 22m</div>
            <div>AUDIO_SYSTEM: {isAudioEnabled ? "ACTIVE" : "DISABLED"}</div>
          </div>
        );
        break;
      default:
        playSfx("error");
        isError = true;
        output = `Command not found: ${command}. Type 'help' for available commands.`;
    }

    setHistory(prev => [...prev, { command: cmd, output, isError }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ 
            y: 0,
            opacity: [0.95, 1, 0.98, 1],
          }}
          exit={{ y: "-100%" }}
          transition={{ 
            y: { type: "spring", damping: 30, stiffness: 300 },
            opacity: { duration: 0.2, repeat: Infinity, repeatType: "reverse" }
          }}
          className="fixed top-0 left-0 right-0 z-[100] h-[45vh] bg-black/95 border-b border-green-500/30 backdrop-blur-xl shadow-2xl flex flex-col font-mono overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          <NeuralPulse className="opacity-30" />
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-green-500/10 bg-green-500/5 relative z-20">
            <div className="flex items-center gap-3">
              <TerminalIcon className="h-4 w-4 text-green-500" />
              <FrankenGlitch trigger="always" intensity="low">
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Monster_Kernel_Shell v1.0.4</span>
              </FrankenGlitch>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setTerminalOpen(false); }}
              data-magnetic="true"
              className="p-1 hover:bg-white/5 rounded-md transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* History */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-hide relative z-20"
          >
            {history.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <ChevronRight className="h-3 w-3 text-green-500/50" />
                  <span>{item.command}</span>
                </div>
                <div className={cn("text-sm pl-5", item.isError ? "text-red-400" : "text-slate-300")}>
                  {item.isError ? (
                    <FrankenGlitch trigger="always" intensity="low">
                      {item.output}
                    </FrankenGlitch>
                  ) : (
                    item.output
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit}
            className="px-6 py-4 bg-green-500/5 border-t border-green-500/10 flex items-center gap-3 relative z-20"
          >
            <ChevronRight className="h-4 w-4 text-green-500" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-green-400 font-mono text-sm placeholder:text-green-900"
              placeholder="Enter command..."
              spellCheck={false}
              autoComplete="off"
            />
            <div className="text-[10px] text-green-900 font-black uppercase">Line: {history.length + 1}</div>
          </form>

          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-30" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}