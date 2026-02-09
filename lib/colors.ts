/**
 * Utility to extract CSS colors from Tailwind-like gradient strings
 * used in the flywheel visualization nodes.
 */
export function getColorDefinition(colorStr: string) {
  if (colorStr.includes("from-green-600")) {
    return { primary: "#16a34a", secondary: "#10b981", glow: "rgba(34, 197, 94, 0.5)", from: "#16a34a", to: "#10b981", rgb: "22, 163, 74" };
  }
  if (colorStr.includes("from-emerald-500")) {
    return { primary: "#10b981", secondary: "#14b8a6", glow: "rgba(16, 185, 129, 0.5)", from: "#10b981", to: "#14b8a6", rgb: "16, 185, 129" };
  }
  if (colorStr.includes("from-teal-400")) {
    return { primary: "#2dd4bf", secondary: "#06b6d4", glow: "rgba(45, 212, 191, 0.5)", from: "#2dd4bf", to: "#06b6d4", rgb: "45, 212, 191" };
  }
  if (colorStr.includes("from-cyan-500")) {
    return { primary: "#06b6d4", secondary: "#0ea5e9", glow: "rgba(6, 182, 212, 0.5)", from: "#06b6d4", to: "#0ea5e9", rgb: "6, 182, 212" };
  }
  if (colorStr.includes("from-red-600") || colorStr.includes("from-rose-500")) {
    return { primary: "#ef4444", secondary: "#f43f5e", glow: "rgba(239, 68, 68, 0.5)", from: "#ef4444", to: "#f43f5e", rgb: "239, 68, 68" };
  }
  if (colorStr.includes("from-orange-500") || colorStr.includes("from-amber-500")) {
    return { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245, 158, 11, 0.5)", from: "#f59e0b", to: "#fbbf24", rgb: "245, 158, 11" };
  }

  // Default fallback
  return { primary: "#22c55e", secondary: "#10b981", glow: "rgba(34, 197, 94, 0.5)", from: "#22c55e", to: "#10b981", rgb: "34, 197, 94" };
}
