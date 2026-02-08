"use client";

import Image from "next/image";
import { Tweet as ReactTweet } from "react-tweet";
import { ArrowRight, MessageSquare, Heart, Repeat2, Eye, Bookmark, Zap } from "lucide-react";
import type { Tweet } from "@/lib/content";
import { FrankenBolt, FrankenStitch } from "./franken-elements";
import { BorderBeam } from "./motion-wrapper";
import { motion } from "framer-motion";

/* ── Inner content for fallback cards (no outer chrome) ── */

function FallbackContent({ tweet }: { tweet: Tweet }) {
  const hasLink = typeof tweet.tweetUrl === "string";
  const hasMetrics = typeof tweet.likes === "number";

  return (
    <div className="flex flex-col p-8">
      {/* Author header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <Zap className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-black text-white leading-tight">{tweet.author}</p>
          <p className="text-[10px] font-bold text-green-500/50">{tweet.handle}</p>
        </div>
        <span className="ml-auto text-[10px] font-bold text-slate-600 font-mono">{tweet.date}</span>
      </div>

      <p className="text-base leading-relaxed text-slate-300 mb-6">{tweet.content}</p>

      {hasMetrics && (
        <div className="flex items-center gap-5 text-slate-500 text-[11px] font-bold mb-6">
          {typeof tweet.replies === "number" && (
            <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" />{tweet.replies}</span>
          )}
          {typeof tweet.reposts === "number" && (
            <span className="flex items-center gap-1.5"><Repeat2 className="h-3.5 w-3.5" />{tweet.reposts}</span>
          )}
          <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" />{tweet.likes}</span>
          {typeof tweet.views === "number" && (
            <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" />{(tweet.views / 1000).toFixed(1)}K</span>
          )}
          {typeof tweet.bookmarks === "number" && tweet.bookmarks > 0 && (
            <span className="flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5" />{tweet.bookmarks}</span>
          )}
        </div>
      )}

      {hasLink && (
        <a
          href={tweet.tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-green-400 hover:text-green-300 transition-colors"
        >
          View Source <ArrowRight className="h-3 w-3" />
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
    <div className={`franken-tweet-card relative rounded-2xl overflow-hidden border border-green-500/10 bg-[rgba(5,18,5,0.6)] backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.4)] hover:border-green-500/30 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-500 hover:-translate-y-1 ${className ?? ""}`}>
      {/* Top stitch + bolts */}
      <FrankenStitch className="absolute top-0 left-1/4 right-1/4 w-1/2 opacity-20 group-hover:opacity-60 transition-opacity duration-500" />
      <FrankenBolt className="absolute -left-1 -top-1 z-20" />
      <FrankenBolt className="absolute -right-1 -top-1 z-20" />

      {withBottomBolts && (
        <>
          <FrankenBolt className="absolute -left-1 -bottom-1 z-20" />
          <FrankenBolt className="absolute -right-1 -bottom-1 z-20" />
        </>
      )}

      {/* Animated border beam — visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <BorderBeam />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom glow seam + stitch */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
      <FrankenStitch className="absolute bottom-0 left-1/4 right-1/4 w-1/2 rotate-180 opacity-20 group-hover:opacity-60 transition-opacity duration-500" />
    </div>
  );
}

/* ── Glassmorphic Frankenstein wrapper for react-tweet embeds ── */

function EmbeddedTweetCard({ tweet, index }: { tweet: Tweet; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      viewport={{ once: true }}
      className="tweet-embed-wrapper group"
    >
      <GlassFrankenCard>
        <div data-theme="dark">
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
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: (index % 3) * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="group"
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
      <div className="absolute -right-4 -top-32 w-64 h-64 opacity-[0.07] pointer-events-none hidden xl:block select-none">
        <Image
          src="/images/frankentui-alien-artifact.webp"
          alt=""
          fill
          sizes="256px"
          className="object-contain rotate-6 blur-[0.5px]"
          aria-hidden="true"
        />
      </div>

      <div className="tweet-wall-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
