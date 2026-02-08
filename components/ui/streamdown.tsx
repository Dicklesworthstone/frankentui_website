"use client";

import { Fragment, useMemo } from "react";
import { cn } from "@/lib/utils";
import RustCodeBlock from "@/components/rust-code-block";

interface StreamdownProps {
  content: string;
  className?: string;
}

type StreamPart =
  | { type: "text"; content: string }
  | { type: "code"; lang: string; content: string };

/**
 * A visceral, high-performance Markdown-lite renderer.
 * Optimized for streaming and technical descriptors.
 */
export default function Streamdown({ content, className }: StreamdownProps) {
  const parts = useMemo<StreamPart[]>(() => {
    if (!content) return [];

    // Split by code blocks first
    const regex = new RegExp("```(\\w+)?\\n([\\s\\S]*?)```", "g");
    const result: StreamPart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

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
    <div className={cn(
      "prose-franken space-y-6 text-slate-300 leading-relaxed font-medium text-lg",
      className
    )}>
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
          <div key={i} className="space-y-6">
            {renderMarkdownLite(part.content, `stream-${i}`)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Safe, markdown-lite renderer for "text" parts.
 *
 * Goals:
 * - Avoid `dangerouslySetInnerHTML` (XSS + invalid markup hazards)
 * - Keep output deterministic (hydration-safe)
 * - Support a small subset: headings, lists, bold/italic, links, inline code, line breaks
 */
function renderMarkdownLite(text: string, keyPrefix: string): React.ReactNode[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();

    if (trimmed === "") {
      i += 1;
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4
          key={`${keyPrefix}-h4-${blockIndex}`}
          className="text-white font-black uppercase tracking-widest text-sm"
        >
          {renderInline(trimmed.slice(4), `${keyPrefix}-h4-${blockIndex}`)}
        </h4>
      );
      i += 1;
      blockIndex += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3
          key={`${keyPrefix}-h3-${blockIndex}`}
          className="text-white font-black tracking-tight text-2xl"
        >
          {renderInline(trimmed.slice(3), `${keyPrefix}-h3-${blockIndex}`)}
        </h3>
      );
      i += 1;
      blockIndex += 1;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2
          key={`${keyPrefix}-h2-${blockIndex}`}
          className="text-white font-black tracking-tighter text-4xl"
        >
          {renderInline(trimmed.slice(2), `${keyPrefix}-h2-${blockIndex}`)}
        </h2>
      );
      i += 1;
      blockIndex += 1;
      continue;
    }

    // Unordered list (- item)
    if (/^\s*-\s+/.test(raw)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*-\s+/, ""));
        i += 1;
      }

      blocks.push(
        <ul key={`${keyPrefix}-ul-${blockIndex}`} className="space-y-2">
          {items.map((item, idx) => (
            <li key={`${keyPrefix}-ul-${blockIndex}-li-${idx}`} className="flex gap-3">
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"
                aria-hidden="true"
              />
              <span>{renderInline(item, `${keyPrefix}-ul-${blockIndex}-li-${idx}`)}</span>
            </li>
          ))}
        </ul>
      );

      blockIndex += 1;
      continue;
    }

    // Paragraph (until blank line)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const line = lines[i] ?? "";
      if (line.trim() === "") break;
      // Stop paragraph if next line begins a new block type
      if (line.trim().startsWith("# ") || line.trim().startsWith("## ") || line.trim().startsWith("### ")) break;
      if (/^\s*-\s+/.test(line)) break;

      paragraphLines.push(line);
      i += 1;
    }

    blocks.push(
      <p key={`${keyPrefix}-p-${blockIndex}`}>
        {paragraphLines.map((line, lineIdx) => (
          <Fragment key={`${keyPrefix}-p-${blockIndex}-ln-${lineIdx}`}>
            {renderInline(line, `${keyPrefix}-p-${blockIndex}-ln-${lineIdx}`)}
            {lineIdx < paragraphLines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </p>
    );

    blockIndex += 1;

    // Consume the blank line after a paragraph, if present
    while (i < lines.length && (lines[i] ?? "").trim() === "") i += 1;
  }

  return blocks;
}

function renderInline(text: string, keyPrefix: string) {
  const nodes = tokenizeInline(text);
  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={`${keyPrefix}-${i}`}>{node}</Fragment>
      ))}
    </>
  );
}

function sanitizeHref(rawHref: string): { href: string; isExternal: boolean } | null {
  const href = rawHref.trim();
  if (!href) return null;

  // Allow hash + relative links (will resolve within the current origin).
  if (href.startsWith("#") || href.startsWith("/")) {
    return { href, isExternal: false };
  }

  try {
    const resolved = new URL(href, "https://frankentui.com");
    const protocol = resolved.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:") {
      const isExternal = href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:");
      return { href, isExternal };
    }
    return null;
  } catch {
    return null;
  }
}

function tokenizeInline(text: string): React.ReactNode[] {
  // Regex for inline tokens: 
  // 1. Triple asterisks (bold-italic) - must have content
  // 2. Double asterisks (bold) - must have content
  // 3. Single asterisk (italic) - must have content
  // 4. Backticks (inline code) - must have content
  // 5. Links [label](url) - must have both
  const re = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*)/g;

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`") && token.length > 2) {
      nodes.push(
        <code key={match.index} className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-[0.95em] text-green-300">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("[") && token.includes("](")) {
      const sep = token.indexOf("](");
      const label = token.slice(1, sep);
      const hrefRaw = token.slice(sep + 2, -1);
      
      if (!label || !hrefRaw) {
        nodes.push(token);
      } else {
        const safe = sanitizeHref(hrefRaw);
        if (!safe) {
          nodes.push(label);
        } else {
          nodes.push(
            <a
              key={match.index}
              href={safe.href}
              target={safe.isExternal ? "_blank" : undefined}
              rel={safe.isExternal ? "noopener noreferrer" : undefined}
              className="text-green-400 hover:text-green-300 transition-colors underline decoration-green-500/30 underline-offset-4 font-bold"
            >
              {label}
            </a>
          );
        }
      }
    } else if (token.startsWith("***") && token.length > 6) {
      nodes.push(
        <strong key={match.index} className="text-white font-black">
          <em className="italic">{token.slice(3, -3)}</em>
        </strong>
      );
    } else if (token.startsWith("**") && token.length > 4) {
      nodes.push(<strong key={match.index} className="text-white font-black">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.length > 2) {
      nodes.push(<em key={match.index} className="italic text-slate-200">{token.slice(1, -1)}</em>);
    } else {
      nodes.push(token);
    }

    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
