"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Video } from "@/lib/content";
import { FrankenContainer } from "./franken-elements";

export default function VideoPlayer({ video }: { video: Video }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setHasStarted(true);
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  return (
    <FrankenContainer className="overflow-hidden bg-black/30">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          preload="none"
          poster={video.poster}
          controls={hasStarted}
          playsInline
          className="h-full w-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          {video.sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
          Your browser does not support the video tag.
        </video>

        {!isPlaying && (
          <button
            type="button"
            onClick={handlePlay}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/20"
            aria-label={`Play ${video.title}`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/90 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5" fill="currentColor" />
            </div>
          </button>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white leading-tight">{video.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{video.description}</p>
      </div>
    </FrankenContainer>
  );
}
