"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import RustCodeBlock from "@/components/rust-code-block";

interface StreamdownProps {
  content: string;
  className?: string;
}

/**
 * A visceral, high-performance Markdown-lite renderer.
 * Optimized for streaming and technical descriptors.
 */
export default function Streamdown({ content, className }: StreamdownProps) {
  const parts = useMemo(() => {
    if (!content) return [];

    // Split by code blocks first
    const regex = new RegExp("```(\\w+)?\\n([\\s\\S]*?)```", "g");
    const result = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Push text before code block
      if (match.index > lastIndex) {
        result.push({
          type: "text" as const,
          content: content.slice(lastIndex, match.index),
        });
      }

      // Push code block
      result.push({
        type: "code" as const,
        lang: match[1] || "rust",
        content: match[2].trim(),
      });

      lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < content.length) {
      result.push({
        type: "text" as const,
        content: content.slice(lastIndex),
      });
    }

    return result;
  }, [content]);

  return (
    <div className={cn("space-y-6", className)}>
      {parts.map((part, i) => {
        if (part.type === "code") {
          // We can reuse RustCodeBlock if the language is rust
          // For now, we'll use it for everything as it's the most polished
          return (
            <div key={i} className="my-6">
              <RustCodeBlock code={part.content} title={part.lang ? `source.${part.lang}` : "source"} />
            </div>
          );
        }

        return (
          <div
            key={i}
            className="prose-franken text-slate-300 leading-relaxed font-medium text-lg"
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(part.content),
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Simple regex-based markdown parser for the "text" parts
 */
function parseMarkdown(text: string): string {
  return text
    // Headings
    .replace(/^### (.*$)/gm, '<h4 class="text-white font-black uppercase tracking-widest mt-8 mb-4 text-sm">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 class="text-white font-black tracking-tight mt-10 mb-6 text-2xl">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 class="text-white font-black tracking-tighter mt-12 mb-8 text-4xl">$1</h2>')
    
    // Bold / Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white font-black italic">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:text-green-300 transition-colors underline decoration-green-500/30 underline-offset-4 font-bold">$1</a>')
    
    // Inline Code
    .replace(/`(.*?)`/g, '<code class="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-sm text-green-300">$1</code>')
    
    // Lists
    .replace(/^\s*-\s+(.*$)/gm, '<li class="flex gap-3 mb-2"><span class="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span><span>$1</span></li>')
    .replace(/((?:<li[\s\S]*?<\/li>\s*)+)/g, '<ul class="my-6 space-y-2">$1</ul>')
    
    // Newlines to breaks
    .replace(/\n\n/g, '</div><div class="mt-6">')
    .replace(/\n/g, "<br />");
}
