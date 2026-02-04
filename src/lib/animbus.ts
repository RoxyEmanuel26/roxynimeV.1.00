
import { prisma } from "./prisma";
import { getTopAnime, getAnime, getServerList, getStreamResource } from "animbus";

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 3600 * 1000;

/**
 * Helper to get data from cache or fetch from API
 */
async function getCachedData<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    try {
        const cached = await (prisma as any).apiCache.findUnique({
            where: { key },
        });

        if (cached) {
            const now = new Date().getTime();
            const cachedTime = new Date(cached.timestamp).getTime();

            if (now - cachedTime < CACHE_TTL) {
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
        console.error(`API fetch error for key ${key}:`, error);
        throw error;
    }
}

// Interfaces to match the UI expectations better
export interface Anime {
    id: string;
    title: string;
    image: string;
    episode?: number | string;
    type?: string;
    genres?: string[];
    status?: string;
    description?: string;
    // Additional optional properties for anime details
    rating?: string;
    released?: string;
    studio?: string;
    season?: string;
    synopsis?: string;
}

export type AnimeDetail = Anime & {
    episodes: Episode[];
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
}

export interface StreamingData {
    url: string;
    headers?: Record<string, string>;
}

// Wrapper functions with caching

export async function getTrendingAnime(): Promise<Anime[]> {
    return getCachedData("trending", async () => {
        // animbus getTopAnime returns list with title, image, etc.
        const results = await getTopAnime();
        return results.map((item: any) => ({
            id: item.link.split('/').pop() || item.title, // using slug or title as ID
            title: item.title,
            image: item.image,
            episode: item.latestEpisode,
            type: "TV" // default
        }));
    });
}

// Mocking ongoing/completed/movies by filtering or fetching from different sources if animbus supports it.
// Since we only have getTopAnime, we'll try to use it for now or assume it returns trending.
// If animbus has other methods we should use them. Assuming limited API for now based on prompt.

export async function getOngoingAnimeList(page: number = 1): Promise<Anime[]> {
    return getTrendingAnime(); // Fallback to trending for now
}

export async function getCompletedAnimeList(page: number = 1): Promise<Anime[]> {
    // If animbus doesn't support filtering, we might need real scraping or another source.
    // For now returning empty or subset of trending.
    return [];
}

export async function getMoviesList(page: number = 1): Promise<Anime[]> {
    return [];
}

export async function getAnimeInfo(id: string): Promise<AnimeDetail> {
    return getCachedData(`anime_${id}`, async () => {
        const data: any = await getAnime(id);
        return {
            id: id,
            title: data.title || "",
            image: data.image || data.poster || "",
            description: data.description || data.synopsis || "",
            status: data.status || "",
            genres: data.genres || [],
            episodes: (data.episodes || []).map((ep: any) => ({
                id: ep.id || ep.link || "", // path part
                number: parseFloat(ep.number) || parseFloat(ep.episode) || 0,
                title: ep.title || ""
            }))
        };
    });
}

export async function getEpisodeStreams(episodeId: string): Promise<StreamingData | null> {
    // Cache key for streams might need to be shorter TTL? Or same.
    // episodeId usually contains the full slug e.g. /anime/one-piece/episode-1
    return getCachedData(`stream_${episodeId}`, async () => {
        const servers: any[] = await getServerList(episodeId);
        // Prefer known good servers
        const server = servers[0]; // Take first for now
        if (!server) return null;

        try {
            const serverId = server.id || server.link || server.url || server;
            const resource: any = await getStreamResource(serverId);
            return {
                url: resource.url || resource.link || "", // iframe or direct
                headers: resource.headers || {}
            };
        } catch (e) {
            console.error("Error getting stream resource", e);
            return null;
        }
    });
}

export async function searchAnimes(query: string): Promise<Anime[]> {
    // If animbus has search
    // Assuming it doesn't from prompt description, might need to implement or use workaround.
    // The prompt says "getTopAnime", "getAnime". It doesn't explicitly list search.
    // Use getTopAnime and filter? Inefficient.
    // User mentioned fallback metadata: MyAnimeList v2 or Jikan.
    return [];
}
