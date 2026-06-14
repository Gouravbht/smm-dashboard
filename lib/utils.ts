import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) {
    const thousands = Math.floor(n / 1_000);
    return `${thousands.toLocaleString("en-IN")}K`;
  }
  return n.toLocaleString("en-IN");
}

export function formatMoM(delta: number): string {
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

export function platformColor(platform: string): string {
  switch (platform) {
    case "instagram": return "#E1306C";
    case "youtube":   return "#FF0000";
    case "facebook":  return "#1877F2";
    default:          return "#6366f1";
  }
}

export function platformLabel(platform: string): string {
  switch (platform) {
    case "instagram": return "Instagram";
    case "youtube":   return "YouTube";
    case "facebook":  return "Facebook";
    default:          return platform;
  }
}
