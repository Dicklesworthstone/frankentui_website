import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Detect if an element is a text input, textarea, or contenteditable.
 * Useful for suppressing keyboard shortcuts during typing.
 */
export function isTextInputLike(el: Element | null): boolean {
  if (!el) return false;
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("[contenteditable='true']"));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO date to readable string with relative time for recent dates
 */
export function formatDate(isoString: string) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO date to full readable string
 */
export function formatDateFull(isoString: string) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}
