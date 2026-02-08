"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Github, Terminal as TerminalIcon, Eye, Home, Network, LayoutGrid, Skull, Info, Cpu, Zap, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { FrankenBolt, NeuralPulse } from "./franken-elements";
import { useSite } from "@/lib/site-state";
import FrankenGlitch from "./franken-glitch";
import { Magnetic } from "./motion-wrapper";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { setTerminalOpen, toggleAnatomyMode, isAnatomyMode, isAudioEnabled, toggleAudio } = useSite();

  useBodyScrollLock(open);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return Home;
      case 'showcase': return Eye;
      case 'architecture': return Cpu;
      case 'war stories': return Skull;
      case 'project graph': return Network;
      case 'glossary': return Info;
      case 'get started': return Zap;
      default: return LayoutGrid;
    }
  };

  return (
    <>
      {/* ── DESKTOP NAVBAR (Hyper-Optimized) ───────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:block pointer-events-none h-24">
        <header
          className={cn(
            "absolute top-6 left-1/2 -translate-x-1/2 flex items-center transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-auto",
            "w-[95%] lg:w-[1200px] h-16 px-8 rounded-full border border-white/5",
            scrolled ? "glass-modern shadow-2xl scale-[0.98] border-green-500/20" : "bg-transparent border-transparent"
          )}
        >
          {scrolled && <NeuralPulse className="opacity-40" />}
          
          <div className="flex items-center justify-between w-full relative z-10">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <FrankenGlitch trigger="hover" intensity="low">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-green-600 via-green-400 to-lime-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-transform group-hover:scale-110 active:scale-95">
                  <FrankenBolt className="absolute -left-1 -top-1 z-20 scale-50" />
                  <FrankenBolt className="absolute -right-1 -bottom-1 z-20 scale-50" />
                  <span className="text-xl font-black text-black select-none">F</span>
                </div>
              </FrankenGlitch>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white uppercase leading-none">
                  {siteConfig.name}
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-left">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="relative flex h-1.5 w-1.5"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </motion.div>
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest leading-none">ALIVE</span>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Magnetic key={item.href} strength={0.1}>
                    <Link
                      href={item.href}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black uppercase tracking-wide",
                        active ? "text-green-400" : "text-slate-400 hover:text-white"
                      )}
                    >
                      <AnimatePresence>
                        {hoveredItem === item.href && (
                          <motion.div
                            layoutId="nav-hover"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-green-500/10 border border-green-500/20 rounded-full -z-10"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>
                      {active && !hoveredItem && (
                        <motion.div 
                          layoutId="nav-active-dot"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" 
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  </Magnetic>
                );
              })}
            </nav>

            {/* Tools */}
            <div className="flex items-center gap-2">
              <button onClick={() => setTerminalOpen(true)} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-green-400 transition-colors" title="Open Terminal ( ` )">
                <TerminalIcon className="h-4 w-4" />
              </button>
              <button onClick={toggleAnatomyMode} className={cn("p-2 rounded-full transition-colors", isAnatomyMode ? "bg-green-500/20 text-green-400" : "hover:bg-white/5 text-slate-400 hover:text-white")} title="Toggle Anatomy Mode (Ctrl+Shift+X)">
                <Eye className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <Magnetic strength={0.2}>
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" data-magnetic="true" className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-green-400 transition-all hover:scale-105 active:scale-95">
                  <Github className="h-4 w-4" />
                  <span>GITHUB</span>
                </a>
              </Magnetic>
            </div>
          </div>
        </header>
      </div>

      {/* ── MOBILE BOTTOM NAV (Reach Optimized) ───────────────── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] pointer-events-none">
        <nav className="glass-modern h-16 rounded-2xl border border-white/10 flex items-center justify-around px-2 pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = getIcon(item.label);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90",
                  active ? "text-green-400" : "text-slate-500"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", active && "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]")} />
                <span className="text-[8px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
                {active && (
                  <motion.div 
                    layoutId="mobile-active-glow"
                    className="absolute inset-0 bg-green-500/5 rounded-xl -z-10" 
                  />
                )}
              </Link>
            );
          })}
          <div className="w-px h-8 bg-white/5 mx-1" />
          <button 
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-500 active:scale-90 transition-all"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-[8px] font-black uppercase tracking-tighter">MORE</span>
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar (Accessible via 'More') */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] z-[80] bg-[#020a02] border-l border-green-500/20 p-8 flex flex-col md:hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xs font-black text-green-500 uppercase tracking-[0.4em]">Sub_System_Menu</span>
                <button onClick={() => setOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6 text-left">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between group"
                  >
                    <span className={cn("text-2xl font-black transition-colors uppercase tracking-tighter", pathname === item.href ? "text-green-400" : "text-slate-500")}>
                      {item.label}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-800" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { toggleAnatomyMode(); setOpen(false); }} className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all", isAnatomyMode ? "bg-green-500 text-black border-green-400" : "bg-white/5 border-white/10 text-slate-400")}>ANATOMY</button>
                  <button onClick={() => { toggleAudio(); setOpen(false); }} className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all", isAudioEnabled ? "bg-green-500 text-black border-green-400" : "bg-white/5 border-white/10 text-slate-400")}>AUDIO</button>
                </div>
                <button onClick={() => { setTerminalOpen(true); setOpen(false); }} className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em]">SHELL_INTERFACE</button>
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-green-500 text-black font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <Github className="h-4 w-4" /> GITHUB_REPOSITORY
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
