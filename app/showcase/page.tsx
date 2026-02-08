import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { screenshots, videos } from "@/lib/content";
import type { Video } from "@/lib/content";
import SectionShell from "@/components/section-shell";
import ScreenshotGallery from "@/components/screenshot-gallery";
import VideoPlayer from "@/components/video-player";
import FrankenEye from "@/components/franken-eye";

export const metadata: Metadata = {
  title: "Showcase",
  description: "Screenshots and demos of FrankenTUI terminal UI framework",
};

export default function ShowcasePage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-black">
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 md:pb-24 md:pt-44 lg:px-8">
          {/* Peeking eyes */}
          <div className="absolute top-24 right-8 hidden md:block opacity-30 hover:opacity-100 transition-opacity">
            <FrankenEye className="rotate-12 scale-75" />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-gradient-to-r from-green-500/80 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-widest text-green-400/90">
              Gallery
            </p>
          </div>

          <h1
            className="font-bold tracking-tighter text-white"
            style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
          >
            Showcase
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400/90 md:text-xl md:leading-relaxed">
            See FrankenTUI in action. Explore screenshots of every major feature
            and watch full video demos of the terminal UI framework running in
            real terminals.
          </p>
        </div>
      </header>

      {/* ── Screenshot gallery section ───────────────────────── */}
      <SectionShell
        id="screenshots"
        icon="eye"
        title="Screenshots"
        kicker="All ten showcase views — dashboards, widgets, visual effects, data visualization, and more. Click any image to enlarge."
      >
        <ScreenshotGallery screenshots={screenshots} columns={2} />
      </SectionShell>

      {/* ── Video demos section ──────────────────────────────── */}
      <SectionShell
        id="video-demos"
        icon="play"
        title="Video Demos"
        kicker="Watch FrankenTUI running live in real terminal emulators with resize handling, CRT effects, and full interactivity."
      >
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {videos.map((video: Video) => (
            <VideoPlayer key={video.title} video={video} />
          ))}
        </div>
      </SectionShell>

      {/* ── CTA section ──────────────────────────────────────── */}
      <section className="relative mx-auto max-w-7xl px-4 pb-32 pt-8 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-900/40 bg-gradient-to-br from-green-950/50 via-emerald-950/30 to-black p-10 md:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-green-900/15 via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Ready to build with FrankenTUI?
              </h2>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-400/90 md:text-lg">
                Get started in minutes with our step-by-step guide. Add the
                crate, write your first Model, and see it render.
              </p>
            </div>

            <Link
              href="/getting-started"
              className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition-all hover:bg-green-500 hover:shadow-green-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
