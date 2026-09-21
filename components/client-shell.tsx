"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import CustomCursor from "@/components/custom-cursor";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import SignalHUD from "@/components/signal-hud";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SiteTerminal from "@/components/site-terminal";
import { SiteProvider } from "@/lib/site-state";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <ErrorBoundary>
      <SiteProvider>
        <div className="flex min-h-screen flex-col overflow-x-hidden relative">
          <SignalHUD />
          <SiteTerminal />
          <CustomCursor />

          <SiteHeader />

          {/* Exit animations (AnimatePresence mode="wait") are incompatible with the App
              Router: the outgoing page's children are swapped for the new route mid-exit,
              and the presence swap can stall, leaving the page stuck at opacity 0 until an
              unrelated re-render. Enter-only fade, remounted per route via key. */}
          <motion.div
            key={pathname}
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: prefersReducedMotion ? 0 : 0.4,
                ease: "easeOut",
              },
            }}
            className="flex-1 relative"
          >
            {children}
          </motion.div>

          <SiteFooter />
          <ScrollToTop />
        </div>
      </SiteProvider>
    </ErrorBoundary>
  );
}
