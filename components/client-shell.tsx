"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import CustomCursor from "@/components/custom-cursor";
import { SiteProvider } from "@/lib/site-state";
import MemoryDump from "@/components/memory-dump";
import SiteTerminal from "@/components/site-terminal";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <ErrorBoundary>
      <SiteProvider>
        <div className="flex min-h-screen flex-col overflow-x-hidden relative">
          <MemoryDump />
          <SiteTerminal />
          <CustomCursor />
          
          <SiteHeader />
          
          <AnimatePresence 
            mode="wait" 
            onExitComplete={() => setIsTransitioning(false)}
          >
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, filter: "brightness(0)" }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: "brightness(1)",
                transition: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.1
                }
              }}
              exit={prefersReducedMotion ? { opacity: 0 } : { 
                opacity: 0, 
                scale: 1.02, 
                filter: "brightness(2) contrast(1.2)",
                transition: {
                  duration: 0.3,
                  ease: [0.32, 0, 0.67, 0]
                }
              }}
              onAnimationStart={() => setIsTransitioning(true)}
              className="flex-1 relative"
            >
              {/* Stitched Transition Overlay */}
              <AnimatePresence>
                {isTransitioning && !prefersReducedMotion && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] pointer-events-none flex justify-around items-center"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ 
                          scaleY: [0, 1, 1, 0], 
                          opacity: [0, 0.5, 0.5, 0],
                          y: [0, (i % 2 === 0 ? 20 : -20), 0]
                        }}
                        transition={{ 
                          duration: 0.6, 
                          delay: i * 0.02,
                          times: [0, 0.2, 0.8, 1]
                        }}
                        className="w-px h-full bg-green-500/30"
                      >
                        <div className="absolute top-1/4 w-4 h-[2px] bg-green-500/40 -left-2" />
                        <div className="absolute top-1/2 w-4 h-[2px] bg-green-500/40 -left-2" />
                        <div className="absolute top-3/4 w-4 h-[2px] bg-green-500/40 -left-2" />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transition Noise & Flicker Overlay */}
              <AnimatePresence>
                {isTransitioning && !prefersReducedMotion && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.1, 0.05, 0.15, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, times: [0, 0.2, 0.4, 0.6, 1] }}
                      className="fixed inset-0 z-50 pointer-events-none bg-white/10 mix-blend-overlay"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-20"
                    />
                  </>
                )}
              </AnimatePresence>

              {children}
            </motion.div>
          </AnimatePresence>
          
          <SiteFooter />
          <ScrollToTop />
        </div>
      </SiteProvider>
    </ErrorBoundary>
  );
}
