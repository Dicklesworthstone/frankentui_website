"use client";

import { useEffect } from "react";
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
          
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1, 
                transition: {
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.1
                }
              }}
              exit={{ 
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: "easeIn"
                }
              }}
              className="flex-1 relative"
            >
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
