"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Github } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const resolvedPath = pathname ?? "";

  const isActive = (href: string) => {
    if (href === "/") return resolvedPath === "/";
    return resolvedPath.startsWith(href);
  };

  useEffect(() => {
    let ticking = false;
    let rafId: number | null = null;
    let lastScrolled = false;

    const update = () => {
      const next = window.scrollY > 20;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setOpen(false);
      }
    };

    closeOnDesktop();
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      setOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [resolvedPath, open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useBodyScrollLock(open);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-green-950/50 bg-[#020a02]/80 backdrop-blur-xl py-3"
            : "border-transparent bg-transparent py-5"
        )}
        style={{ paddingRight: "var(--scrollbar-width, 0px)" }}
        role="banner"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-green-500 via-emerald-400 to-lime-400 shadow-lg shadow-green-500/20 transition-transform group-hover:scale-105">
              <span className="text-lg font-black text-white">F</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden items-center gap-4 md:flex lg:gap-8"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
                    active ? "text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId={prefersReducedMotion ? undefined : "nav-pill"}
                      className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-white/10"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}

            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 lg:ml-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 lg:px-5 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-all active:scale-95"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
            >
              <span className="relative h-5 w-5">
                <X
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-100" : "opacity-0"
                  )}
                />
                <Menu
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-opacity duration-200",
                    open ? "opacity-0" : "opacity-100"
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 flex flex-col bg-[#020a02]/98 backdrop-blur-lg md:hidden overflow-y-auto will-change-[opacity]"
            style={{ transform: "translateZ(0)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav className="relative flex flex-1 flex-col justify-center px-8">
              <motion.div
                className="flex flex-col gap-8"
                initial="hidden"
                animate="visible"
                variants={prefersReducedMotion ? undefined : {
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
                  },
                }}
              >
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <motion.div
                      key={item.href}
                      variants={prefersReducedMotion ? undefined : {
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } },
                      }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "text-4xl font-bold tracking-tight transition-colors",
                          active ? "text-white" : "text-slate-500 active:text-slate-300"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                className="mt-16"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: [0.33, 1, 0.68, 1], delay: 0.1 + navItems.length * 0.06 }}
              >
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-4 text-lg font-bold text-white shadow-lg shadow-green-500/20 transition-transform active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
