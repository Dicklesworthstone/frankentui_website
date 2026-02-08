"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Screenshot } from "@/lib/content";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { FrankenContainer } from "./franken-elements";

export default function ScreenshotGallery({
  screenshots,
  columns = 2,
}: {
  screenshots: Screenshot[];
  columns?: 2 | 3;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const resolvedLightboxIndex =
    lightboxIndex !== null && screenshots.length > 0
      ? Math.min(lightboxIndex, screenshots.length - 1)
      : null;
  const isLightboxOpen = resolvedLightboxIndex !== null;

  useBodyScrollLock(isLightboxOpen);

  const openLightbox = useCallback((index: number) => {
    if (index >= 0 && index < screenshots.length) {
      setLightboxIndex(index);
    }
  }, [screenshots.length]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    if (screenshots.length === 0) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % screenshots.length : null
    );
  }, [screenshots.length]);

  const goPrev = useCallback(() => {
    if (screenshots.length === 0) return;
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + screenshots.length) % screenshots.length : null
    );
  }, [screenshots.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, closeLightbox, goNext, goPrev]);

  return (
    <>
      <div
        className={cn(
          "grid gap-4 md:gap-6",
          columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
        )}
      >
        {screenshots.map((screenshot, index) => (
          <button
            type="button"
            key={screenshot.src}
            onClick={() => openLightbox(index)}
            className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <FrankenContainer className="overflow-hidden transition-all group-hover:border-green-500/30 group-hover:shadow-lg group-hover:shadow-green-500/10">
              <div className="relative aspect-[16/10]">
                <Image
                  src={screenshot.src}
                  alt={screenshot.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <p className="absolute bottom-0 left-0 right-0 p-4 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {screenshot.title}
                </p>
              </div>
            </FrankenContainer>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {resolvedLightboxIndex !== null && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={screenshots[resolvedLightboxIndex].title}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Next screenshot"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <motion.div
              key={resolvedLightboxIndex}
              initial={prefersReducedMotion ? {} : { scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={screenshots[resolvedLightboxIndex].src}
                alt={screenshots[resolvedLightboxIndex].alt}
                width={1600}
                height={1000}
                className="rounded-lg object-contain"
                sizes="90vw"
                priority
              />
              <p className="mt-4 text-center text-sm font-medium text-slate-300">
                {screenshots[resolvedLightboxIndex].title}
                <span className="ml-2 text-slate-500">
                  {resolvedLightboxIndex + 1} / {screenshots.length}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
