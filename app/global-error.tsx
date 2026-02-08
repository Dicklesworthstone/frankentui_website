"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#020a02] text-white">
        <div className="flex flex-col items-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="mb-6 max-w-md text-white/50">
            The renderer encountered a panic. Error digest:{" "}
            {error.digest ?? "unknown"}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-medium text-black transition-all hover:bg-green-400"
          >
            <RefreshCw size={18} />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
