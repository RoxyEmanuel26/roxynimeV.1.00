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

    // FIXED: kalau fallback ke search, inject pagination manual
    return {
        data: filtered,
        pagination: response.pagination || {
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: page > 1,
            totalPages: page,
            lastVisiblePage: page,
            items: { count: response.data.length, total: response.data.length, per_page: 20 }
        }
    };
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
    const mappedData = response.data.map(toAnime);
    return {
        data: mappedData,
        pagination: response.pagination || {
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: page > 1,
            totalPages: page,
            lastVisiblePage: page,
            items: { count: mappedData.length, total: mappedData.length, per_page: 20 }
        },
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

    // BUG D FIX: Search Jikan (MyAnimeList) Pagination Fallback
    const hasResults = response && response.data && response.data.length > 0;
    const isOtakudesu = !source || source.toLowerCase() === "otakudesu";

    if (!hasResults && isOtakudesu) {
        console.log(`[animbus] Searching Jikan API fallback for: ${query}`);
        try {
            // Kita fetch 10 hasil dari Jikan
            const jikanRes = await fetch(
                `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`,
                { signal: AbortSignal.timeout(5000) }
            );

            if (jikanRes.status === 429) {
                console.warn("[animbus] Jikan rate limited, skipping fallback");
                return { data: response.data.map(toAnime), pagination: response.pagination };
            }

            if (jikanRes.ok) {
                const jikanData = await jikanRes.json();
                const jikanItems = jikanData.data || [];

                if (jikanItems.length > 0) {
                    const finalData = jikanItems.map((item: any) => ({
                        id: item.mal_id.toString(),
                        slug: item.mal_id.toString(),
                        title: item.title,
                        image: item.images?.webp?.image_url || item.images?.jpg?.image_url,
                        poster: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url,
                        rating: item.score?.toString(),
                        type: item.type,
                        status: item.status,
                        synopsis: item.synopsis,
                        episode: item.episodes?.toString() || "?",
                        released: item.year?.toString() || "Unknown",
                        _source: "jikan"
                    }));

                    return {
                        data: finalData as Anime[],
                        pagination: {
                            currentPage: 1,
                            hasNextPage: jikanData.pagination?.has_next_page || false,
                            hasPrevPage: false,
                            lastVisiblePage: jikanData.pagination?.last_visible_page || 1,
                            totalPages: jikanData.pagination?.last_visible_page || 1,
                            items: {
                                count: finalData.length,
                                total: jikanData.pagination?.items?.total || finalData.length,
                                per_page: jikanData.pagination?.items?.per_page || 10
                            }
                        }
                    };
                }
            } else {
                throw new Error(`Jikan HTTP ${jikanRes.status}`);
            }
        } catch (error) {
            console.error("[animbus] Jikan fallback search error:", error);
        }
    }

    return {
        data: response.data.map(toAnime),
        pagination: response.pagination,
    };
}

// Re-export PaginationInfo for backward compatibility
export type { PaginationInfo } from "./providers";
