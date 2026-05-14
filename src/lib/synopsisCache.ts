/**
 * synopsisCache.ts — Centralized synopsis + genres cache with batch prefetch
 *
 * Architecture:
 * - Module-level Map persists across React re-renders and navigations
 * - prefetchBatch() fetches multiple anime details in background with
 *   concurrency control (max 3 concurrent, staggered start)
 * - AnimeCard reads from cache → instant popover, zero loading time
 * - Uses requestIdleCallback for non-blocking background work
 */

export interface CachedAnimeDetail {
    synopsis: string;
    genres: string[];
    rating?: number;
}

// ═══ Module-level singleton cache ═══
const cache = new Map<string, CachedAnimeDetail>();
const pendingFetches = new Set<string>();
const MAX_CONCURRENT = 3;
const STAGGER_MS = 150; // delay between starting each fetch

/** Get cached data for an anime. Returns undefined if not cached. */
export function getCachedSynopsis(animeId: string, source?: string): CachedAnimeDetail | undefined {
    return cache.get(cacheKey(animeId, source));
}

/** Set cached data for an anime manually (e.g., from server-side data). */
export function setCachedSynopsis(animeId: string, source: string | undefined, data: CachedAnimeDetail): void {
    cache.set(cacheKey(animeId, source), data);
}

/** Check if a fetch is already in-flight for this anime. */
export function isFetchPending(animeId: string, source?: string): boolean {
    return pendingFetches.has(cacheKey(animeId, source));
}

/** Get current cache size (for debugging). */
export function getCacheSize(): number {
    return cache.size;
}

function cacheKey(animeId: string, source?: string): string {
    return `${animeId}_${source || 'default'}`;
}

/**
 * Fetch a single anime detail and store in cache.
 * Returns the cached data, or null on failure.
 */
export async function fetchAndCache(
    animeId: string,
    source?: string,
    signal?: AbortSignal
): Promise<CachedAnimeDetail | null> {
    const key = cacheKey(animeId, source);

    // Already cached
    const existing = cache.get(key);
    if (existing) return existing;

    // Already in-flight
    if (pendingFetches.has(key)) return null;

    pendingFetches.add(key);

    try {
        const url = `/api/anime/${encodeURIComponent(animeId)}${source ? `?source=${source}` : ''}`;
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json?.data) throw new Error('No data');

        const detail: CachedAnimeDetail = {
            synopsis: json.data.synopsis || json.data.description || "",
            genres: json.data.genres || [],
            rating: json.data.rating ? parseFloat(json.data.rating) : undefined,
        };

        cache.set(key, detail);
        return detail;
    } catch (err: any) {
        if (err?.name === 'AbortError') return null;
        // Cache empty result to prevent retries on persistent errors
        cache.set(key, { synopsis: "", genres: [] });
        return null;
    } finally {
        pendingFetches.delete(key);
    }
}

/**
 * Batch prefetch synopsis for multiple anime in the background.
 * Uses concurrency control and staggered starts to avoid hammering the API.
 * Non-blocking — uses requestIdleCallback where available.
 *
 * @param animes - Array of { id, source } to prefetch
 * @param options - Optional configuration
 */
export function prefetchBatch(
    animes: Array<{ id: string; source?: string; description?: string }>,
    options?: { maxConcurrent?: number; signal?: AbortSignal }
): void {
    const { maxConcurrent = MAX_CONCURRENT, signal } = options || {};

    // Filter out items that already have description, are cached, or are episode slugs
    const toFetch = animes.filter(a => {
        if (!a.id) return false;
        if (a.description && a.description.trim()) return false;
        const key = cacheKey(a.id, a.source);
        if (cache.has(key)) return false;
        if (pendingFetches.has(key)) return false;
        // Skip episode slugs
        const lower = a.id.toLowerCase();
        if (/-episode-\d+/.test(lower) || /-eps-\d+/.test(lower)) return false;
        return true;
    });

    if (toFetch.length === 0) return;

    // Use requestIdleCallback for truly non-blocking prefetch
    const startPrefetch = () => {
        let activeCount = 0;
        let idx = 0;

        const fetchNext = () => {
            if (signal?.aborted) return;
            while (activeCount < maxConcurrent && idx < toFetch.length) {
                const item = toFetch[idx++];
                activeCount++;

                fetchAndCache(item.id, item.source, signal)
                    .finally(() => {
                        activeCount--;
                        // Stagger next fetch
                        if (idx < toFetch.length && !signal?.aborted) {
                            setTimeout(fetchNext, STAGGER_MS);
                        }
                    });
            }
        };

        fetchNext();
    };

    // Delay start to not compete with critical page resources
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(startPrefetch, { timeout: 3000 });
    } else {
        setTimeout(startPrefetch, 1500);
    }
}
