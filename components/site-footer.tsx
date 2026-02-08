"use client";

import { Github, Twitter, ArrowUp } from "lucide-react";
import Link from "next/link";
import { siteConfig, navItems } from "@/lib/content";

const socialLinks = [
  { href: siteConfig.social.github, icon: Github, label: "GitHub" },
  { href: siteConfig.social.x, icon: Twitter, label: "X" },
];

export default function SiteFooter() {
  const handleBackToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  return (
    <footer
      className="relative mt-32"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" aria-hidden="true" />

      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.04),transparent_70%)] pointer-events-none" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Desktop: 3-column layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="space-y-3">
            <p className="text-lg font-bold tracking-tight text-slate-100">
              {siteConfig.name}
            </p>
            <p className="text-sm leading-relaxed text-slate-500" suppressHydrationWarning>
              Minimal, high-performance terminal UI kernel for Rust.
              <br />
              &copy; {new Date().getFullYear()} Jeffrey Emanuel. MIT License.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-end gap-6">
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 transition-transform group-hover:rotate-12" aria-hidden="true" />
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={handleBackToTop}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
              aria-label="Back to top"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex flex-col gap-10 lg:hidden">
          <div className="space-y-2">
            <p className="text-lg font-bold tracking-tight text-slate-100">
              {siteConfig.name}
            </p>
            <p className="text-sm leading-relaxed text-slate-500">
              Minimal, high-performance terminal UI kernel for Rust.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>

          <p className="text-xs text-slate-600" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Jeffrey Emanuel. MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
