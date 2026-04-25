import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/winbu";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

// ── Mapper helpers ──────────────────────────────────────────────────────────

/**
 * Map a list/home item to ProviderAnime.
 * Winbu list items have: title, id, type, image, rating, time, episode, views
 */
function mapListItem(item: any, defaultStatus = "Unknown"): ProviderAnime {
    const id = item.id || "";
    const rating = item.rating && item.rating !== "-" && item.rating !== "0"
        ? parseFloat(item.rating)
        : undefined;

    // Episode field comes as "Episode 5" or "" from the API
    let episode: string | undefined = item.episode || undefined;

    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.image || "",
        synopsis: item.description || "",
        genres: [],
        type: mapType(item.type),
        status: defaultStatus,
        episode,
        rating: rating && !isNaN(rating) ? rating : undefined,
    };
}

/**
 * Map a home top10 item to ProviderAnime.
 * Top10 items have: rank, title, id, type, image, rating
 */
function mapTop10Item(item: any): ProviderAnime {
    const id = item.id || "";
    const rating = item.rating && item.rating !== "-" && item.rating !== "0"
        ? parseFloat(item.rating)
        : undefined;

    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.image || "",
        type: mapType(item.type),
        status: "Unknown",
        rating: rating && !isNaN(rating) ? rating : undefined,
    };
}

/**
 * Map search result item to ProviderAnime.
 * Search items have: title, id, type, image, description, rating, episode
 */
function mapSearchItem(item: any): ProviderAnime {
    const id = item.id || "";
    const rating = item.rating && item.rating !== "-" && item.rating !== "0"
        ? parseFloat(item.rating)
        : undefined;

    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.image || "",
        synopsis: item.description || "",
        type: mapType(item.type),
        status: "Unknown",
        episode: item.episode || undefined,
        rating: rating && !isNaN(rating) ? rating : undefined,
    };
}

/**
 * Normalize Winbu type strings to standard types.
 */
function mapType(raw?: string): string {
    if (!raw) return "TV";
    const t = raw.toLowerCase();
    if (t === "anime") return "TV";
    if (t === "film") return "Movie";
    if (t === "series") return "Series";
    if (t === "donghua") return "Donghua";
    return raw;
}

/**
 * Convert Winbu pagination to our standard format.
 */
function mapPagination(p: any) {
    if (!p) return undefined;
    return {
        currentPage: p.current_page || 1,
        lastVisiblePage: p.total_pages || 1,
        hasNextPage: p.has_next_page || false,
        hasPrevPage: p.has_prev_page || false,
        totalPages: p.total_pages,
        items: {
            count: 30,
            total: (p.total_pages || 1) * 30,
            per_page: 30,
        },
    };
}

// ── Provider Implementation ─────────────────────────────────────────────────

export const winbuProvider: AnimeProvider = {
    info: {
        id: "winbu",
        name: "Winbu",
        description: "Anime, Film, Series & Donghua lengkap",
        icon: "🌟",
        language: "id",
        contentType: "Mixed",
        features: {
            home: true,
            ongoing: true,
            completed: true,
            search: true,
            detail: true,
            streaming: true,
            schedule: true,
            genres: true,
            movies: true,
        },
    },

    // ── Home ─────────────────────────────────────────────────────────────────
    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("winbu_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) { console.error("[Winbu] Home HTTP:", res.status); return []; }
                const json = await res.json();
                const data = json?.data;
                if (!data) return [];

                const results: ProviderAnime[] = [];

                // Latest anime — most valuable for home page
                if (Array.isArray(data.latest_anime)) {
                    data.latest_anime.forEach((item: any) => {
                        results.push(mapListItem(item, "Ongoing"));
                    });
                }

                // Top 10 anime as bonus
                if (Array.isArray(data.top10_anime)) {
                    data.top10_anime.forEach((item: any) => {
                        // Skip duplicates by title
                        if (!results.find(r => r.title === item.title)) {
                            results.push(mapTop10Item(item));
                        }
                    });
                }

                return results;
            } catch (e) {
                console.error("[Winbu] Home Error:", e);
                return [];
            }
        });
    },

    // ── Ongoing ──────────────────────────────────────────────────────────────
    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`winbu_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/ongoing?page=${page}`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                return {
                    data: rawList.map((item: any) => mapListItem(item, "Ongoing")),
                    pagination: mapPagination(json.pagination),
                };
            } catch (e) {
                console.error("[Winbu] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    // ── Completed ────────────────────────────────────────────────────────────
    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`winbu_completed_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/completed?page=${page}`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                return {
                    data: rawList.map((item: any) => mapListItem(item, "Completed")),
                    pagination: mapPagination(json.pagination),
                };
            } catch (e) {
                console.error("[Winbu] Completed Error:", e);
                return { data: [] };
            }
        });
    },

    // ── Detail ───────────────────────────────────────────────────────────────
    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`winbu_detail_${slug}`, async () => {
            try {
                // Winbu has separate detail endpoints for anime, series, and film.
                // Try anime first, then series, then film.
                const types = ["anime", "series", "film"];
                let data: any = null;

                for (const type of types) {
                    try {
                        const res = await fetch(`${BASE}${PREFIX}/${type}/${slug}`, { headers: headers() });
                        if (res.ok) {
                            const json = await res.json();
                            if (json?.data?.title) {
                                data = json.data;
                                break;
                            }
                        }
                    } catch {
                        // Try next type
                    }
                }

                if (!data) throw new Error("Anime not found");

                const info = data.info || {};
                const genres = (info.genres || []).map((g: any) =>
                    typeof g === "string" ? g : g.name || ""
                ).filter(Boolean);

                // Parse episodes — Winbu episodes: { title, id, link }
                const episodes: ProviderEpisode[] = (data.episodes || [])
                    .map((ep: any, index: number) => {
                        // Extract episode number from title like "Episode 5"
                        const numMatch = ep.title?.match(/\d+/);
                        const epNum = numMatch ? parseInt(numMatch[0]) : index + 1;

                        return {
                            id: ep.id || "",
                            number: epNum,
                            title: ep.title || `Episode ${epNum}`,
                            urlSlug: ep.id || "",
                        };
                    })
                    .sort((a: ProviderEpisode, b: ProviderEpisode) => b.number - a.number);

                const rating = info.rating && info.rating !== "-"
                    ? parseFloat(info.rating)
                    : undefined;

                const status = info.status && info.status !== "-" ? info.status : "Unknown";
                const type = info.type && info.type !== "-" ? info.type : "TV";

                return {
                    id: slug,
                    slug,
                    title: data.title || "",
                    poster: data.image || "",
                    synopsis: data.synopsis || "",
                    genres,
                    type: mapType(type),
                    status,
                    totalEpisodes: episodes.length || undefined,
                    rating: rating && !isNaN(rating) ? rating : undefined,
                    releaseDate: info.release_date && info.release_date !== "-" ? info.release_date : undefined,
                    studio: info.studio && info.studio !== "-" ? info.studio : undefined,
                    season: info.season && info.season !== "-" ? info.season : undefined,
                    duration: info.duration && info.duration !== "-" ? info.duration : undefined,
                    episodes,
                };
            } catch (e) {
                console.error("[Winbu] Detail Error:", e);
                throw e;
            }
        });
    },

    // ── Search ───────────────────────────────────────────────────────────────
    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`winbu_search_${query}`, async () => {
            try {
                const res = await fetch(
                    `${BASE}${PREFIX}/search?q=${encodeURIComponent(query)}&page=1`,
                    { headers: headers() }
                );
                if (!res.ok) return { data: [] };
                const json = await res.json();

                // Search response: { results: [...] }
                const results = json?.results || json?.data || [];
                if (!Array.isArray(results) || results.length === 0) return { data: [] };

                return {
                    data: results.map((item: any) => mapSearchItem(item)),
                    pagination: mapPagination(json.pagination),
                };
            } catch (e) {
                console.error("[Winbu] Search Error:", e);
                return { data: [] };
            }
        });
    },

    // ── Streams ──────────────────────────────────────────────────────────────
    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`winbu_stream_${episodeSlug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/episode/${episodeSlug}`, { headers: headers() });
                if (!res.ok) return [];
                const json = await res.json();
                const data = json?.data;
                if (!data) return [];

                const servers: ProviderStreamServer[] = [];

                // Winbu streams: [{ resolution, server, data: { post, nume, type } }]
                if (Array.isArray(data.streams)) {
                    for (const stream of data.streams) {
                        const { post, nume, type: sType } = stream.data || {};
                        if (post && nume && sType) {
                            // Resolve the embed URL via the server endpoint
                            try {
                                const embedRes = await fetch(
                                    `${BASE}${PREFIX}/server?post=${post}&nume=${nume}&type=${sType}`,
                                    { headers: headers() }
                                );
                                if (embedRes.ok) {
                                    const embedJson = await embedRes.json();
                                    if (embedJson?.embed_url) {
                                        servers.push({
                                            name: stream.server || "Server",
                                            quality: stream.resolution || "auto",
                                            streamUrl: embedJson.embed_url,
                                        });
                                    }
                                }
                            } catch {
                                // Skip failed server resolution
                            }
                        }
                    }
                }

                return servers;
            } catch (e) {
                console.error("[Winbu] Stream Error:", e);
                return [];
            }
        });
    },

    // ── Movies ───────────────────────────────────────────────────────────────
    async getMovies(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`winbu_movies_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/film?page=${page}`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                return {
                    data: rawList.map((item: any) => mapListItem(item, "Completed")),
                    pagination: mapPagination(json.pagination),
                };
            } catch (e) {
                console.error("[Winbu] Movies Error:", e);
                return { data: [] };
            }
        });
    },

    // ── Genre ────────────────────────────────────────────────────────────────
    async getByGenre(genre: string, page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`winbu_genre_${genre}_${page}`, async () => {
            try {
                const res = await fetch(
                    `${BASE}${PREFIX}/genre/${encodeURIComponent(genre)}?page=${page}`,
                    { headers: headers() }
                );
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                return {
                    data: rawList.map((item: any) => mapListItem(item, "Unknown")),
                    pagination: mapPagination(json.pagination),
                };
            } catch (e) {
                console.error("[Winbu] Genre Error:", e);
                return { data: [] };
            }
        });
    },

    // ── Schedule ─────────────────────────────────────────────────────────────
    async getSchedule(): Promise<Record<string, ProviderAnime[]>> {
        return getCachedData("winbu_schedule", async () => {
            try {
                const days = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];
                const schedule: Record<string, ProviderAnime[]> = {};

                const res = await fetch(`${BASE}${PREFIX}/schedule?day=all`, { headers: headers() });
                if (!res.ok) return {};
                const json = await res.json();
                const data = json?.data;

                if (Array.isArray(data)) {
                    // If it's a flat array, group by day or put under "all"
                    schedule["all"] = data.map((item: any) => mapListItem(item, "Ongoing"));
                } else if (data && typeof data === "object") {
                    // If it's grouped by day
                    for (const day of days) {
                        if (Array.isArray(data[day])) {
                            schedule[day] = data[day].map((item: any) => mapListItem(item, "Ongoing"));
                        }
                    }
                }

                return schedule;
            } catch (e) {
                console.error("[Winbu] Schedule Error:", e);
                return {};
            }
        });
    },
};
