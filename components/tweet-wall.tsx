"use client";

import { Twitter } from "lucide-react";
import type { Tweet } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";

function TweetCard({ tweet }: { tweet: Tweet }) {
  const hasExternalPost = tweet.type === "embed" && typeof tweet.tweetUrl === "string";

  return (
    <FrankenContainer withBolts={false} className="group h-full bg-black/30 transition-all hover:border-green-500/20 hover:bg-black/40">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
            <Twitter className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{tweet.author}</p>
            <p className="text-xs text-slate-500">{tweet.handle}</p>
          </div>
          <span className="ml-auto text-xs text-slate-600">{tweet.date}</span>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300 group-hover:text-slate-200 transition-colors italic">
          &ldquo;{tweet.content}&rdquo;
        </p>

        {hasExternalPost && (
          <a
            href={tweet.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-fit items-center rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 transition-all hover:border-green-400/40 hover:bg-green-500/15"
          >
            Open post
          </a>
        )}

        {tweet.hasVideo && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-green-400/70">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Contains video demo
          </div>
        )}
      </div>
    </FrankenContainer>
  );
}

export default function TweetWall({ tweets, limit }: { tweets: Tweet[]; limit?: number }) {
  const displayTweets = limit ? tweets.slice(0, limit) : tweets;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayTweets.map((tweet, i) => (
        <TweetCard key={`${tweet.date}-${tweet.handle}-${tweet.tweetUrl ?? i}`} tweet={tweet} />
      ))}
    </div>
  );
}
