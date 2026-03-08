import { getProvider } from "./providers";
import type {
    ProviderAnime, ProviderAnimeDetail, ProviderStreamServer,
    PaginatedResponse, PaginationInfo,
} from "./providers";

// Re-export types for backward compatibility
export type Anime = Omit<ProviderAnime, "rating"> & {
    image: string;
    poster?: string;
    episode?: number | string;
    description?: string;
    rating?: string;
    released?: string;
    season?: string;
    synopsis?: string;
    japaneseTitle?: string;
};

export type AnimeDetail = Anime & {
    episodes: Episode[];
};

export interface Episode {
    id: string;
    number: number;
    title?: string;
    urlSlug?: string;
}

export interface StreamingData {
    url: string;
    headers?: Record<string, string>;
    servers?: { name: string; quality?: string; streamUrl: string }[];
}

export interface AnimeListResponse {
    data: Anime[];
    pagination?: PaginationInfo;
}

// --- Helper: Convert provider format to legacy UI format ---
function toAnime(p: ProviderAnime): Anime {
    const { rating: numRating, ...rest } = p;
    return {
        ...rest,
        rating: numRating?.toString(),
        image: p.poster,
        poster: p.poster,
        episode: p.totalEpisodes,
        description: p.synopsis,
        released: p.releaseDate,
        synopsis: p.synopsis,
    };
}

function toAnimeDetail(p: ProviderAnimeDetail): AnimeDetail {
    return {
        ...toAnime(p),
        japaneseTitle: p.japaneseTitle,
        season: p.season,
        episodes: p.episodes.map((ep) => ({
            id: ep.urlSlug || ep.id,
            number: ep.number,
            title: ep.title,
            urlSlug: ep.urlSlug,
        })),
    };
}

// --- Public API (backward-compatible) ---

export async function getTrendingAnime(source?: string): Promise<Anime[]> {
    const provider = getProvider(source);
    const data = await provider.getHome();
    return data.map(toAnime);
}

export async function getOngoingAnimeList(page = 1, source?: string): Promise<AnimeListResponse> {
    const provider = getProvider(source);
    const response = await provider.getOngoing(page);
    return {
        data: response.data.map(toAnime),
        pagination: response.pagination,
    };
}

export async function getCompletedAnimeList(page = 1, source?: string): Promise<AnimeListResponse> {
    const provider = getProvider(source);
    const response = await provider.getCompleted(page);
    return {
        data: response.data.map(toAnime),
        pagination: response.pagination,
    };
}

export async function getMoviesList(page = 1, source?: string): Promise<AnimeListResponse> {
    const provider = getProvider(source);

    if (provider.getMovies) {
        const response = await provider.getMovies(page);
        return {
            data: response.data.map(toAnime),
            pagination: response.pagination,
        };
    }

    // Fallback: search for "movie"
    const response = await provider.search("movie");
    const filtered = response.data
        .map(toAnime)
        .filter((a) => {
            const t = a.type?.toLowerCase() || "";
            return t.includes("movie") || t.includes("film") || t === "unknown";
        });

    return { data: filtered, pagination: response.pagination };
}

export async function getAnimeByGenre(genre: string, page = 1, source?: string): Promise<AnimeListResponse> {
    const provider = getProvider(source);

    if (provider.getByGenre) {
        const response = await provider.getByGenre(genre, page);
        return {
            data: response.data.map(toAnime),
            pagination: response.pagination,
        };
    }

    // Fallback: search with genre name
    const response = await provider.search(genre);
    return {
        data: response.data.map(toAnime),
        pagination: response.pagination,
    };
}

export async function getAnimeInfo(id: string, source?: string): Promise<AnimeDetail> {
    const provider = getProvider(source);
    const data = await provider.getDetail(id);
    return toAnimeDetail(data);
}

export async function getEpisodeStreams(episodeId: string, source?: string): Promise<StreamingData | null> {
    try {
        const provider = getProvider(source);
        const servers = await provider.getStreams(episodeId);

        if (!servers || !servers.length) return null;

        return {
            url: servers[0].streamUrl,
            headers: {},
            servers,
        };
    } catch (e) {
        console.error("[animbus] Error getting stream:", e);
        return null;
    }
}

export async function searchAnimes(query: string, source?: string): Promise<AnimeListResponse> {
    const provider = getProvider(source);
    const response = await provider.search(query);
    return {
        data: response.data.map(toAnime),
        pagination: response.pagination,
    };
}

// Re-export PaginationInfo for backward compatibility
export type { PaginationInfo } from "./providers";
