import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function getSeasonFromMonth(month: number): string {
    if (month >= 1 && month <= 3) return "winter";
    if (month >= 4 && month <= 6) return "spring";
    if (month >= 7 && month <= 9) return "summer";
    return "fall";
}

export function getCurrentSeason(): { year: number; season: string } {
    const now = new Date();
    return {
        year: now.getFullYear(),
        season: getSeasonFromMonth(now.getMonth() + 1),
    };
}

export function extractAnimeIdFromSlug(slug: string): string {
    // Extract ID from slug like "/anime/2900/ramen-akaneko/episode/3"
    const match = slug.match(/\/anime\/(\d+)/);
    return match ? match[1] : "";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
}

// Generates a solid color or simple SVG placeholder
export function getBlurDataURL(width = 300, height = 420): string {
    const svg = `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${width}" height="${height}" fill="#1e293b" />
  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
  <defs>
    <linearGradient id="g">
      <stop stop-color="#334155" offset="20%" />
      <stop stop-color="#475569" offset="50%" />
      <stop stop-color="#334155" offset="70%" />
    </linearGradient>
  </defs>
</svg>`;

    // Check if window is defined (client-side) or not (server-side)
    const toBase64 = (str: string) =>
        typeof window === 'undefined'
            ? Buffer.from(str).toString('base64')
            : window.btoa(str);

    return `data:image/svg+xml;base64,${toBase64(svg)}`;
}
