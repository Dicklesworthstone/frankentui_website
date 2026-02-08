"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <SiteFooter />
        <ScrollToTop />
      </div>
    </ErrorBoundary>
  );
}
