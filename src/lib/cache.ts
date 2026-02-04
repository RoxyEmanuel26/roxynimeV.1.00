
import { prisma } from "./prisma";

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 3600 * 1000;

/**
 * Helper to get data from cache or fetch from API
 */
export async function getCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl: number = CACHE_TTL): Promise<T> {
    try {
        const cached = await (prisma as any).apiCache.findUnique({
            where: { key },
        });

        if (cached) {
            const now = new Date().getTime();
            const cachedTime = new Date(cached.timestamp).getTime();

            if (now - cachedTime < ttl) {
                return JSON.parse(cached.data) as T;
            }
        }
    } catch (error) {
        console.warn("Cache read error:", error);
    }

    // Fetch fresh data
    try {
        const data = await fetchFn();

        // Cache the fresh data
        try {
            await (prisma as any).apiCache.upsert({
                where: { key },
                update: {
                    data: JSON.stringify(data),
                    timestamp: new Date(),
                },
                create: {
                    key,
                    data: JSON.stringify(data),
                    timestamp: new Date(),
                },
            });
        } catch (error) {
            console.warn("Cache write error:", error);
        }

        return data;
    } catch (error) {
        // If fetch fails but we have stale cache, return it as backup? 
        // For now, let's just log and throw, or we could handle stale-while-revalidate logic.
        console.error(`API fetch error for key ${key}:`, error);
        throw error;
    }
}
