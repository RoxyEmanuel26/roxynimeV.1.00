// MyAnimeList API v2 Client
// Documentation: https://myanimelist.net/apiconfig/references/api/v2

const MAL_BASE_URL = "https://api.myanimelist.net/v2";

interface MALAnime {
    id: number;
    title: string;
    main_picture?: {
        medium: string;
        large: string;
    };
    synopsis?: string;
    mean?: number;
    rank?: number;
    popularity?: number;
    num_episodes?: number;
    status?: string;
    genres?: { id: number; name: string }[];
    start_season?: { year: number; season: string };
    studios?: { id: number; name: string }[];
    rating?: string;
    source?: string;
    media_type?: string;
}

interface MALAnimeListResponse {
    data: { node: MALAnime }[];
    paging?: { next?: string; previous?: string };
}

const ANIME_FIELDS = [
    "id",
    "title",
    "main_picture",
    "synopsis",
    "mean",
    "rank",
    "popularity",
    "num_episodes",
    "status",
    "genres",
    "start_season",
    "studios",
    "rating",
    "source",
    "media_type",
].join(",");

// In-memory cache
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

async function malFetch<T>(endpoint: string): Promise<T | null> {
    const clientId = process.env.MAL_CLIENT_ID;

    if (!clientId) {
        console.warn("MAL_CLIENT_ID not configured, using mock data");
        return null;
    }

    try {
        const response = await fetch(`${MAL_BASE_URL}${endpoint}`, {
            headers: {
                "X-MAL-CLIENT-ID": clientId,
            },
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            console.error(`MAL API error: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("MAL API fetch error:", error);
        return null;
    }
}

export async function searchMALAnime(query: string, limit: number = 20): Promise<MALAnime[]> {
    const cacheKey = `search_${query}_${limit}`;
    const cached = getCached<MALAnime[]>(cacheKey);
    if (cached) return cached;

    const data = await malFetch<MALAnimeListResponse>(
        `/anime?q=${encodeURIComponent(query)}&limit=${limit}&fields=${ANIME_FIELDS}`
    );

    if (data?.data) {
        const animes = data.data.map((item) => item.node);
        setCache(cacheKey, animes);
        return animes;
    }

    return [];
}

export async function getMALAnimeById(id: number): Promise<MALAnime | null> {
    const cacheKey = `anime_${id}`;
    const cached = getCached<MALAnime>(cacheKey);
    if (cached) return cached;

    const data = await malFetch<MALAnime>(`/anime/${id}?fields=${ANIME_FIELDS}`);

    if (data) {
        setCache(cacheKey, data);
        return data;
    }

    return null;
}

export async function getMALAnimeRanking(
    rankingType: "all" | "bypopularity" | "favorite" | "airing" = "bypopularity",
    limit: number = 20
): Promise<MALAnime[]> {
    const cacheKey = `ranking_${rankingType}_${limit}`;
    const cached = getCached<MALAnime[]>(cacheKey);
    if (cached) return cached;

    const data = await malFetch<MALAnimeListResponse>(
        `/anime/ranking?ranking_type=${rankingType}&limit=${limit}&fields=${ANIME_FIELDS}`
    );

    if (data?.data) {
        const animes = data.data.map((item) => item.node);
        setCache(cacheKey, animes);
        return animes;
    }

    return [];
}

export async function getMALSeasonalAnime(
    year: number,
    season: "winter" | "spring" | "summer" | "fall",
    limit: number = 20
): Promise<MALAnime[]> {
    const cacheKey = `seasonal_${year}_${season}_${limit}`;
    const cached = getCached<MALAnime[]>(cacheKey);
    if (cached) return cached;

    const data = await malFetch<MALAnimeListResponse>(
        `/anime/season/${year}/${season}?limit=${limit}&fields=${ANIME_FIELDS}`
    );

    if (data?.data) {
        const animes = data.data.map((item) => item.node);
        setCache(cacheKey, animes);
        return animes;
    }

    return [];
}

export async function getMALSuggestedAnime(limit: number = 20): Promise<MALAnime[]> {
    // This endpoint requires user authentication, so we'll use ranking instead
    return getMALAnimeRanking("bypopularity", limit);
}

// Mock data for when MAL API is not configured
export function getMockAnimeData(): MALAnime[] {
    return [
        {
            id: 1,
            title: "Demon Slayer: Kimetsu no Yaiba",
            main_picture: {
                medium: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
                large: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
            },
            synopsis: "A young boy becomes a demon slayer to save his sister...",
            mean: 8.5,
            rank: 1,
            popularity: 1,
            num_episodes: 26,
            status: "finished_airing",
            genres: [{ id: 1, name: "Action" }, { id: 2, name: "Fantasy" }],
            start_season: { year: 2019, season: "spring" },
        },
        {
            id: 2,
            title: "Attack on Titan",
            main_picture: {
                medium: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
                large: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
            },
            synopsis: "Humanity fights for survival against giant humanoid creatures...",
            mean: 9.0,
            rank: 2,
            popularity: 2,
            num_episodes: 25,
            status: "finished_airing",
            genres: [{ id: 1, name: "Action" }, { id: 8, name: "Drama" }],
            start_season: { year: 2013, season: "spring" },
        },
        {
            id: 3,
            title: "Jujutsu Kaisen",
            main_picture: {
                medium: "https://cdn.myanimelist.net/images/anime/1171/109222.jpg",
                large: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
            },
            synopsis: "A boy swallows a cursed talisman and becomes a vessel...",
            mean: 8.7,
            rank: 3,
            popularity: 3,
            num_episodes: 24,
            status: "finished_airing",
            genres: [{ id: 1, name: "Action" }, { id: 2, name: "Fantasy" }],
            start_season: { year: 2020, season: "fall" },
        },
    ];
}

export type { MALAnime, MALAnimeListResponse };
