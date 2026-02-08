import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/5">
        <Terminal className="h-10 w-10 text-green-500" />
      </div>
      <h1 className="mb-2 font-mono text-6xl font-bold text-gradient-franken">
        404
      </h1>
      <p className="mb-1 text-xl font-semibold text-white/90">
        Page not found
      </p>
      <p className="mb-8 max-w-md text-white/50">
        The terminal returned an empty buffer. This page doesn&apos;t exist or
        has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 font-medium text-black transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>
    </main>
  );
}
