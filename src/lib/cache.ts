
import { prisma } from "./prisma";

// ══════════════════════════════════════════════════════
//  RoxyNime — Two-Layer Cache (Memory → DB → API)
//  L1: In-memory Map (fast, 5 min TTL)
//  L2: Prisma/PostgreSQL (persistent, 1 hour TTL)
//  + Request Coalescing (singleflight pattern)
// ══════════════════════════════════════════════════════

// Cache TTL in milliseconds
const MEMORY_TTL = 5 * 60 * 1000;   // 5 minutes (L1)
const DB_TTL = 60 * 60 * 1000;      // 1 hour (L2 default)
const STALE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours max stale age

// ─── L1: In-Memory Cache ───────────────────────────────
interface MemoryCacheEntry {
    data: string;       // JSON string
    timestamp: number;
}

const memoryCache = new Map<string, MemoryCacheEntry>();

// Prevent memory leak: evict old entries periodically
const MAX_MEMORY_ENTRIES = 200;

function evictOldEntries() {
    if (memoryCache.size <= MAX_MEMORY_ENTRIES) return;

    const entries = [...memoryCache.entries()];

    // Sort by oldest first, remove expired + excess
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.length - Math.floor(MAX_MEMORY_ENTRIES * 0.75);
    for (let i = 0; i < toRemove; i++) {
        memoryCache.delete(entries[i][0]);
    }
}

// ─── Request Coalescing (Singleflight) ─────────────────
// Prevents thundering herd: 10,000 concurrent requests
// for the same key → only 1 actual API call
const inflightRequests = new Map<string, Promise<any>>();

// ─── Main Cache Function ───────────────────────────────
/**
 * Two-layer cache with stale-while-revalidate + request coalescing:
 * 1. Check L1 (memory) → return if fresh
 * 2. Check L2 (Prisma DB) → return if fresh, populate L1
 * 3. Coalesce concurrent requests → only 1 API call per key
 * 4. On fetch failure → return stale data if available
 */
export async function getCachedData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = DB_TTL
): Promise<T> {
    const now = Date.now();

    // ─── L1: Memory Cache Check ─────────────────────────
    const memEntry = memoryCache.get(key);
    if (memEntry && (now - memEntry.timestamp) < MEMORY_TTL) {
        return JSON.parse(memEntry.data) as T;
    }

    // ─── L2: Prisma DB Cache Check ──────────────────────
    let staleData: string | null = null;
    let staleTimestamp: number = 0;

    try {
        const cached = await (prisma as any).apiCache.findUnique({
            where: { key },
        });

        if (cached) {
            const cachedTime = new Date(cached.timestamp).getTime();
            staleData = cached.data;
            staleTimestamp = cachedTime;

            if (now - cachedTime < ttl) {
                // Fresh DB cache — populate L1 and return
                memoryCache.set(key, { data: cached.data, timestamp: now });
                evictOldEntries();
                return JSON.parse(cached.data) as T;
            }
        }
    } catch (error) {
        console.warn("[Cache] L2 read error:", error);
    }

    // ─── Request Coalescing: Reuse inflight promise ─────
    const inflight = inflightRequests.get(key);
    if (inflight) {
        // Another request is already fetching this key — wait for it
        return inflight as Promise<T>;
    }

    // ─── L3: Fetch Fresh Data from API (single request) ─
    const fetchPromise = (async (): Promise<T> => {
        try {
            const data = await fetchFn();
            const jsonData = JSON.stringify(data);

            // Update L1
            memoryCache.set(key, { data: jsonData, timestamp: Date.now() });
            evictOldEntries();

            // Update L2 (async, non-blocking)
            (prisma as any).apiCache.upsert({
                where: { key },
                update: { data: jsonData, timestamp: new Date() },
                create: { key, data: jsonData, timestamp: new Date() },
            }).catch((err: any) => console.warn("[Cache] L2 write error:", err));

            return data;
        } catch (error) {
            // ─── Stale-While-Revalidate: Return stale on failure ──
            if (staleData && (now - staleTimestamp) < STALE_MAX_AGE) {
                console.warn(`[Cache] API failed for "${key}", serving stale data (age: ${Math.round((now - staleTimestamp) / 60000)}min)`);

                // Refresh L1 with stale data (short TTL so it retries soon)
                memoryCache.set(key, { data: staleData, timestamp: Date.now() - MEMORY_TTL + 60000 });

                return JSON.parse(staleData) as T;
            }

            console.error(`[Cache] API fetch error for "${key}", no stale data available:`, error);
            throw error;
        } finally {
            // ─── Cleanup: Remove from inflight map ──────────
            inflightRequests.delete(key);
        }
    })();

    // Register this promise so concurrent requests can reuse it
    inflightRequests.set(key, fetchPromise);

    return fetchPromise;
}

