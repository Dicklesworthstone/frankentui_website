"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { FrankenBolt } from "./franken-elements";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Simple Rust syntax highlighting with regex
function highlightRust(code: string): string {
  const safeCode = escapeHtml(code);

  return safeCode
    // Strings
    .replace(/(\"[^\"]*\")/g, '<span class="text-lime-300">$1</span>')
    // Comments
    .replace(/(\/\/.*$)/gm, '<span class="text-slate-600">$1</span>')
    // Keywords
    .replace(/\b(use|fn|let|mut|match|impl|struct|enum|pub|self|type|mod|where|for|in|if|else|return|const|static|trait|derive|cfg)\b/g, '<span class="text-green-400 font-semibold">$1</span>')
    // Types and constructors
    .replace(/\b(Self|Cmd|Event|Msg|Rect|Frame|Paragraph|App|ScreenMode|Model|u64|u16|u8|i32|i64|bool|str|String|Vec|Box|Option|Result)\b/g, '<span class="text-emerald-300">$1</span>')
    // Macros
    .replace(/\b(format|println|vec|derive|cfg)!/g, '<span class="text-yellow-300">$1!</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span class="text-amber-300">$1</span>')
    // Function calls
    .replace(/\b([a-z_]+)\(/g, '<span class="text-blue-300">$1</span>(')
    // :: paths
    .replace(/::/g, '<span class="text-slate-500">::</span>')
    // Special values
    .replace(/\b(true|false|none|None|Some)\b/g, '<span class="text-orange-300">$1</span>');
}

export default function RustCodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const highlighted = highlightRust(code);
  const highlightedLines = highlighted.split("\n");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 group">
      {/* Corner bolts */}
      <FrankenBolt className="absolute -left-1 -top-1 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute -right-1 -top-1 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute -left-1 -bottom-1 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <FrankenBolt className="absolute -right-1 -bottom-1 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />

      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
          </div>
          {title && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Terminal className="h-3.5 w-3.5" />
              {title}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 font-mono text-sm leading-relaxed">
          <code>
            {highlightedLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-4 inline-block w-8 select-none text-right text-xs text-slate-700">
                  {i + 1}
                </span>
                <span dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
