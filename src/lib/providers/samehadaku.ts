import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/samehadaku";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

// Samehadaku home item fields: animeId, title, poster, episodes, href, releasedOn, samehadakuUrl
function mapHomeItem(item: any): ProviderAnime {
    const id = item.animeId || item.slug || "";
    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.poster || "",
        synopsis: "",
        genres: [],
        type: "TV",
        status: "Ongoing",
        totalEpisodes: item.episodes ? parseInt(String(item.episodes)) : undefined,
        episode: item.episodes ? String(item.episodes) : undefined,
        rating: undefined,
    };
}

// Samehadaku list item (completed, movies, ongoing, search)
function mapListItem(item: any): ProviderAnime {
    const id = item.animeId || item.slug || "";
    const genres = (item.genreList || item.genres || []).map((g: any) =>
        typeof g === "string" ? g : g.title || g.genreId || "Unknown"
    ).filter(Boolean);
    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.poster || item.image || item.thumb || "",
        synopsis: "",
        genres,
        type: item.type || "TV",
        status: item.status || "Ongoing",
        totalEpisodes: item.episodes ? parseInt(String(item.episodes)) : undefined,
        rating: item.score ? parseFloat(String(item.score)) : undefined,
    };
}

export const samehadakuProvider: AnimeProvider = {
    info: {
        id: "samehadaku",
        name: "Samehadaku",
        description: "Anime subtitle Indonesia — alternatif populer",
        icon: "🦈",
        language: "id",
        contentType: "Anime",
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

    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("samehadaku_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) { console.error("[Samehadaku] Home HTTP:", res.status); return []; }
                const json = await res.json();

                // Response: { data: { recent: { animeList: [...] }, top10: {...} } }
                const recentList = json?.data?.recent?.animeList;
                if (!Array.isArray(recentList) || recentList.length === 0) {
                    console.warn("[Samehadaku] No anime in data.recent.animeList");
                    return [];
                }

                return recentList.map(mapHomeItem);
            } catch (e) {
                console.error("[Samehadaku] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/ongoing?page=${page}`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) { console.error("[Samehadaku] Ongoing HTTP:", res.status); return { data: [] }; }
                const json = await res.json();

                const rawList = json?.data?.animeList || json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapListItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || page,
                        hasNextPage: !!pagination.hasNextPage,
                        hasPrevPage: !!pagination.hasPrevPage || page > 1,
                        totalPages: pagination.totalPages || (pagination.hasNextPage ? page + 1 : page),
                        lastVisiblePage: pagination.totalPages || page,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Samehadaku] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_completed_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/completed?page=${page}&order=latest`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) { console.error("[Samehadaku] Completed HTTP:", res.status); return { data: [] }; }
                const json = await res.json();

                const rawList = json?.data?.animeList || json?.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapListItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || page,
                        hasNextPage: !!pagination.hasNextPage,
                        hasPrevPage: !!pagination.hasPrevPage || page > 1,
                        totalPages: pagination.totalPages || (pagination.hasNextPage ? page + 1 : page),
                        lastVisiblePage: pagination.totalPages || page,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Samehadaku] Completed Error:", e);
                return { data: [] };
            }
        });
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`samehadaku_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) throw new Error(`Samehadaku detail fetch failed: ${res.status}`);
                const response = await res.json();
                const data = response.data || response;

                const genres = (data.genreList || []).map((g: any) =>
                    typeof g === "string" ? g : g.title || g.name || g
                );

                const episodes: ProviderEpisode[] = (data.episodeList || [])
                    .map((ep: any, idx: number) => ({
                        id: ep.episodeId || ep.slug || `ep-${idx}`,
                        number: typeof ep.title === "number" ? ep.title : parseInt(ep.title) || idx + 1,
                        title: `Episode ${typeof ep.title === "number" ? ep.title : ep.title}`,
                        urlSlug: ep.episodeId || ep.slug || "",
                        date: ep.date,
                    }))
                    .sort((a: ProviderEpisode, b: ProviderEpisode) => b.number - a.number);

                return {
                    id: slug,
                    slug,
                    title: data.title || data.english || slug,
                    poster: data.poster || "",
                    synopsis: data.synopsis?.paragraphs?.join("\n\n") || "",
                    genres,
                    type: data.type || "TV",
                    status: data.status || "Unknown",
                    totalEpisodes: data.episodes,
                    rating: data.score?.value ? parseFloat(data.score.value) : undefined,
                    releaseDate: data.aired,
                    studio: data.studios,
                    japaneseTitle: data.japanese,
                    englishTitle: data.english,
                    season: data.season,
                    duration: data.duration,
                    source: data.source,
                    episodes,
                };
            } catch (e) {
                console.error("[Samehadaku] Detail Error:", e);
                throw new Error("Anime not found on Samehadaku");
            }
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_search_${query}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/search?q=${encodeURIComponent(query)}`, {
                    headers: headers(),
                });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                // Try multiple possible response paths
                const rawList = json?.data?.animeList || json?.data || json?.anime_list || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapListItem), pagination: json.pagination };
            } catch (e) {
                console.error("[Samehadaku] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`samehadaku_stream_${episodeSlug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/episode/${episodeSlug}`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) return [];
                const response = await res.json();
                const data = response.data || response;
                if (!data) return [];

                const servers: ProviderStreamServer[] = [];

                if (data.server?.qualities) {
                    data.server.qualities.forEach((qg: any) => {
                        const quality = qg.title || "default";
                        if (Array.isArray(qg.serverList)) {
                            qg.serverList.forEach((srv: any) => {
                                let streamUrl = srv.href || srv.url || "";
                                if (srv.serverId) streamUrl = `${BASE}/anime/server/${srv.serverId}`;
                                if (streamUrl) servers.push({ name: srv.title || srv.name || "Server", quality, streamUrl });
                            });
                        }
                    });
                }

                if (servers.length === 0 && data.defaultStreamingUrl) {
                    servers.push({ name: "Default", quality: "auto", streamUrl: data.defaultStreamingUrl });
                }

                return servers;
            } catch (e) {
                console.error("[Samehadaku] Stream Error:", e);
                return [];
            }
        });
    },

    async getMovies(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_movies_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/movies?page=${page}&order=update`, { headers: headers(), next: { revalidate: 300 } });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                const rawList = json?.data?.animeList || json?.data || [];
                if (!Array.isArray(rawList)) return { data: [] };

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapListItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || page,
                        hasNextPage: !!pagination.hasNextPage,
                        hasPrevPage: !!pagination.hasPrevPage || page > 1,
                        totalPages: pagination.totalPages || page,
                        lastVisiblePage: pagination.totalPages || page,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Samehadaku] Movies Error:", e);
                return { data: [] };
            }
        });
    },

    async getByGenre(genre: string, page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_genre_${genre}_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/genres/${encodeURIComponent(genre)}?page=${page}`, {
                    headers: headers(),
                });
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data?.animeList || json?.data || [];
                if (!Array.isArray(rawList)) return { data: [] };
                return { data: rawList.map(mapListItem), pagination: json.pagination };
            } catch (e) {
                console.error("[Samehadaku] Genre Error:", e);
                return { data: [] };
            }
        });
    },
};
