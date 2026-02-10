"use client";

import Image from "next/image";
import { Tweet as ReactTweet } from "react-tweet";
import { ArrowRight, MessageSquare, Heart, Repeat2, Eye, Zap } from "lucide-react";
import type { Tweet } from "@/lib/content";
import { FrankenBolt, FrankenStitch } from "./franken-elements";
import { BorderBeam } from "./motion-wrapper";
import { motion } from "framer-motion";

/* ── Inner content for fallback cards (no outer chrome) ── */

function FallbackContent({ tweet }: { tweet: Tweet }) {
  const hasLink = typeof tweet.tweetUrl === "string";
  const hasMetrics = typeof tweet.likes === "number";

  return (
    <div className="flex flex-col p-6 md:p-7">
      {/* Author header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex flex-col text-left">
          <p className="text-sm font-black text-slate-200 leading-tight tracking-tight">{tweet.author}</p>
          <p className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest">{tweet.handle}</p>
        </div>
        <span className="ml-auto text-[10px] font-bold text-slate-600 font-mono bg-white/5 px-2 py-1 rounded-md">{tweet.date}</span>
      </div>

      <p className="text-[15px] md:text-base leading-7 text-slate-300 font-medium mb-7 text-left selection:bg-green-500/30">
        {tweet.content}
      </p>

      {hasMetrics && (
        <div className="flex items-center gap-6 text-slate-600 text-[11px] font-bold mb-7 border-t border-white/5 pt-5">
          {typeof tweet.replies === "number" && (
            <span className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-default"><MessageSquare className="h-3.5 w-3.5" />{tweet.replies}</span>
          )}
          {typeof tweet.reposts === "number" && (
            <span className="flex items-center gap-1.5 hover:text-green-400 transition-colors cursor-default"><Repeat2 className="h-3.5 w-3.5" />{tweet.reposts}</span>
          )}
          <span className="flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-default"><Heart className="h-3.5 w-3.5" />{tweet.likes}</span>
          {typeof tweet.views === "number" && (
            <span className="flex items-center gap-1.5 hover:text-blue-400 transition-colors cursor-default"><Eye className="h-3.5 w-3.5" />{(tweet.views / 1000).toFixed(1)}K</span>
          )}
        </div>
      )}

      {hasLink && (
        <a
          href={tweet.tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-green-400 transition-colors"
        >
          VIEW_ORIGIN_PROTOCOL 
          <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-1" />
        </a>
      )}
    </div>
  );
}

/* ── Glassmorphic card shell (bolts, stitches, glow, border beam) ── */

function GlassFrankenCard({
  children,
  withBottomBolts = false,
  className,
}: {
  children: React.ReactNode;
  withBottomBolts?: boolean;
  className?: string;
}) {
  return (
    <div className={`franken-tweet-card relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl hover:border-green-500/30 transition-all duration-700 hover:shadow-green-500/10 group ${className ?? ""}`}>
      {/* Top stitch + bolts */}
      <FrankenStitch className="absolute top-0 left-1/4 right-1/4 w-1/2 opacity-10 group-hover:opacity-40 transition-opacity duration-700" />
      <FrankenBolt className="absolute -left-1 -top-1 z-20" />
      <FrankenBolt className="absolute -right-1 -top-1 z-20" />

      {withBottomBolts && (
        <>
          <FrankenBolt className="absolute -left-1 -bottom-1 z-20" />
          <FrankenBolt className="absolute -right-1 -bottom-1 z-20" />
        </>
      )}

      {/* Animated border beam — visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <BorderBeam />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>

      {/* Bottom glow seam + stitch */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      <FrankenStitch className="absolute bottom-0 left-1/4 right-1/4 w-1/2 rotate-180 opacity-10 group-hover:opacity-40 transition-opacity duration-700" />
    </div>
  );
}

/* ── Glassmorphic Frankenstein wrapper for react-tweet embeds ── */

function EmbeddedTweetCard({ tweet, index }: { tweet: Tweet; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className="tweet-embed-wrapper group inline-block w-full break-inside-avoid mb-6"
    >
      <GlassFrankenCard>
        <div data-theme="dark" className="p-1">
          <ReactTweet
            id={tweet.tweetId!}
            fallback={<FallbackContent tweet={tweet} />}
          />
        </div>
      </GlassFrankenCard>
    </motion.div>
  );
}

/* ── Standalone fallback card (Grok / no embed ID) ── */

function FallbackCard({ tweet, index }: { tweet: Tweet; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-100px" }}
      className="group inline-block w-full break-inside-avoid mb-6"
    >
      <GlassFrankenCard withBottomBolts>
        <FallbackContent tweet={tweet} />
      </GlassFrankenCard>
    </motion.div>
  );
}

/* ── Grid with floating alien artifact decoration ── */

export default function TweetWall({ tweets }: { tweets: Tweet[] }) {
  return (
    <div className="relative">
      {/* Floating Frankenstein decoration — large screens only */}
      <div className="absolute -right-12 -top-40 w-80 h-80 opacity-[0.05] pointer-events-none hidden xl:block select-none">
        <Image
          src="/images/frankentui-alien-artifact.webp"
          alt=""
          fill
          sizes="320px"
          className="object-contain rotate-12 blur-[1px]"
          aria-hidden="true"
        />
      </div>

      <div className="tweet-wall-grid columns-1 md:columns-2 gap-x-6">
        {tweets.map((tweet, i) =>
          tweet.tweetId ? (
            <EmbeddedTweetCard key={tweet.tweetId} tweet={tweet} index={i} />
          ) : (
            <FallbackCard key={`${tweet.date}-${tweet.handle}-${i}`} tweet={tweet} index={i} />
          )
        )}
      </div>
    </div>
  );
}
