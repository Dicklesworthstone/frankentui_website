"use client";

import { useRef, useState, useCallback } from "react";
import { Play, Terminal } from "lucide-react";
import type { Video } from "@/lib/content";
import { FrankenContainer, NeuralPulse } from "./franken-elements";
import FrankenGlitch from "./franken-glitch";

export default function VideoPlayer({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const startPlayback = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setHasStarted(true);
    } catch (err) {
      console.error("Playback failed", err);
    }
  }, []);

  return (
    <FrankenContainer
      withPulse={true}
      className="group relative overflow-hidden glass-modern border-green-500/10 hover:border-green-500/30 transition-all duration-700 w-full"
    >
      <div className="relative bg-black overflow-hidden aspect-video">
        <video
          ref={videoRef}
          preload="metadata"
          poster={video.poster}
          playsInline
          controls={hasStarted}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
          onEnded={() => setHasStarted(false)}
        >
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>

        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-10 opacity-30" />

        {/* Play button overlay — only visible before first play */}
        {!hasStarted && (
          <button
            type="button"
            onClick={startPlayback}
            data-magnetic="true"
            aria-label={`Play video: ${video.title}`}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 cursor-pointer transition-colors hover:bg-black/20 group/play"
          >
            <div className="h-24 w-24 rounded-full bg-green-500 text-black flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.5)] transition-all group-hover/play:scale-110 active:scale-95">
              <Play className="h-10 w-10 fill-current translate-x-1" />
            </div>
          </button>
        )}
      </div>

      <div className="px-8 py-8 text-left relative z-20">
        <div className="flex items-center gap-3 mb-4">
           <Terminal className="h-4 w-4 text-green-500/60" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Visual_Capture_Archive</span>
        </div>
        <FrankenGlitch trigger="hover" intensity="low">
          <h3 className="text-2xl font-black text-white group-hover:text-green-400 transition-colors tracking-tight">
            {video.title}
          </h3>
        </FrankenGlitch>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-400 max-w-2xl">
          {video.description}
        </p>
      </div>
    </FrankenContainer>
  );
}

