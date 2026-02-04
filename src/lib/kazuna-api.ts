// Kazuna Streaming API Client
// Base URL: https://luckyindraefendi.me/api/v2

const KAZUNA_BASE_URL = process.env.KAZUNA_API_URL || "https://luckyindraefendi.me/api/v2";

export interface KazunaAnime {
    type: string[];
    slug: string;
    title: string;
    episode: string;
    image: string;
}

export interface KazunaAnimeResponse {
    status: string;
    data: KazunaAnime[];
    total_item: number;
    has_next: { has_next_page: boolean };
    has_prev: { has_prev_page: boolean };
    current_page: number;
}

export interface KazunaAnimeDetail {
    title: string;
    slug: string;
    image: string;
    synopsis: string;
    type: string;
    status: string;
    episodes: KazunaEpisode[];
    genres: string[];
    rating: string;
    studio: string;
    season: string;
    released: string;
}

export interface KazunaEpisode {
    episode: string;
    slug: string;
    title?: string;
}

export interface KazunaStreamingData {
    title: string;
    episode: string;
    streams: KazunaStream[];
    download?: KazunaDownload[];
}

export interface KazunaStream {
    quality: string;
    url: string;
    type: string;
}

export interface KazunaDownload {
    quality: string;
    url: string;
}

// Cache for API responses (1 hour TTL)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data as T;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: unknown): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export async function getOngoingAnime(page: number = 1): Promise<KazunaAnimeResponse> {
    const cacheKey = `ongoing_${page}`;
    const cached = getCached<KazunaAnimeResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/anime/ongoing?order_by=updated&page=${page}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) throw new Error("Failed to fetch ongoing anime");

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Error fetching ongoing anime:", error);
        return {
            status: "error",
            data: [],
            total_item: 0,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };
    }
}

export async function getCompletedAnime(page: number = 1): Promise<KazunaAnimeResponse> {
    const cacheKey = `completed_${page}`;
    const cached = getCached<KazunaAnimeResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/anime/completed?page=${page}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) throw new Error("Failed to fetch completed anime");

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Error fetching completed anime:", error);
        return {
            status: "error",
            data: [],
            total_item: 0,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };
    }
}

export async function getMovieAnime(page: number = 1): Promise<KazunaAnimeResponse> {
    const cacheKey = `movie_${page}`;
    const cached = getCached<KazunaAnimeResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/anime/movie?page=${page}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) throw new Error("Failed to fetch movies");

        const data = await response.json();
        setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return {
            status: "error",
            data: [],
            total_item: 0,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };
    }
}

export async function getAnimeDetails(animeId: string): Promise<KazunaAnimeDetail | null> {
    const cacheKey = `detail_${animeId}`;
    const cached = getCached<KazunaAnimeDetail>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/anime/${animeId}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === "success" && data.data) {
            setCache(cacheKey, data.data);
            return data.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching anime details:", error);
        return null;
    }
}

export async function getEpisodeStreaming(
    animeId: string,
    episodeId: string
): Promise<KazunaStreamingData | null> {
    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/anime/${animeId}/episode/${episodeId}`,
            { cache: "no-store" }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (data.status === "success" && data.data) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching episode streaming:", error);
        return null;
    }
}

export async function getGenreList(): Promise<{ id: string; name: string }[]> {
    const cacheKey = "genres";
    const cached = getCached<{ id: string; name: string }[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/genre`,
            { next: { revalidate: 86400 } }
        );

        if (!response.ok) return [];

        const data = await response.json();
        if (data.status === "success" && data.data) {
            setCache(cacheKey, data.data);
            return data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
}

export async function getSchedule(): Promise<Record<string, KazunaAnime[]>> {
    const cacheKey = "schedule";
    const cached = getCached<Record<string, KazunaAnime[]>>(cacheKey);
    if (cached) return cached;

    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/schedule`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return {};

        const data = await response.json();
        if (data.status === "success" && data.data) {
            setCache(cacheKey, data.data);
            return data.data;
        }
        return {};
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return {};
    }
}

export async function searchAnime(query: string, page: number = 1): Promise<KazunaAnimeResponse> {
    try {
        const response = await fetch(
            `${KAZUNA_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`,
            { cache: "no-store" }
        );

        if (!response.ok) {
            throw new Error("Search failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Error searching anime:", error);
        return {
            status: "error",
            data: [],
            total_item: 0,
            has_next: { has_next_page: false },
            has_prev: { has_prev_page: false },
            current_page: page,
        };
    }
}
