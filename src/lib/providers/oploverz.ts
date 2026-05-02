import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/oploverz";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

function mapItem(item: any): ProviderAnime {
    let slug = item.slug || "";
    // Jika slug "anime" atau "episode", ambil dari oploverz_url sebagai fallback
    if (slug === "anime" || slug === "episode" || slug === "") {
        if (item.oploverz_url) {
            const parts = item.oploverz_url.split('/').filter(Boolean);
            slug = parts[parts.length - 1];
        }
    }
    
    const rawEp = item.episode || item.episode_info ? String(item.episode || item.episode_info) : "";
    const parsedNum = rawEp ? parseInt(rawEp.replace(/\D/g, "")) : undefined;
    
    return {
        id: slug,
        slug,
        title: item.title || "",
        poster: item.poster || "",
        synopsis: "",
        genres: [],
        type: item.type || "TV",
        status: item.status || "",
        totalEpisodes: parsedNum && !isNaN(parsedNum) ? parsedNum : undefined,
        episode: rawEp || undefined,
        rating: undefined,
    };
}

export const oploverzProvider: AnimeProvider = {
    info: {
        id: "oploverz",
        name: "Oploverz",
        description: "Nonton anime dengan kualitas terbaik",
        icon: "💎",
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
            genres: false,
            movies: false,
        },
    },

    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("oploverz_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) { console.error("[Oploverz] Home HTTP:", res.status); return []; }
                const json = await res.json();

                // Response: { anime_list: [...], pagination: {...} }
                const rawList = json?.anime_list;
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    console.warn("[Oploverz] No anime in anime_list");
                    return [];
                }

                return rawList.map(mapItem);
            } catch (e) {
                console.error("[Oploverz] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`oploverz_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/ongoing?page=${page}`, { headers: headers() });
                if (!res.ok) { console.error("[Oploverz] Ongoing HTTP:", res.status); return { data: [] }; }
                const json = await res.json();

                const rawList = json?.anime_list;
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    return { data: [] };
                }

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || page,
                        hasNextPage: !!pagination.hasNext,
                        hasPrevPage: !!pagination.hasPrev || page > 1,
                        totalPages: pagination.totalPages || (pagination.hasNext ? page + 1 : page),
                        lastVisiblePage: pagination.totalPages || page,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Oploverz] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`oploverz_completed_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/completed?page=${page}`, { headers: headers() });
                if (!res.ok) { console.error("[Oploverz] Completed HTTP:", res.status); return { data: [] }; }
                const json = await res.json();

                const rawList = json?.anime_list;
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    return { data: [] };
                }

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || page,
                        hasNextPage: !!pagination.hasNext,
                        hasPrevPage: !!pagination.hasPrev || page > 1,
                        totalPages: pagination.totalPages || (pagination.hasNext ? page + 1 : page),
                        lastVisiblePage: pagination.totalPages || page,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Oploverz] Completed Error:", e);
                return { data: [] };
            }
        });
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`oploverz_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers() });
                if (!res.ok) throw new Error(`Oploverz detail failed: ${res.status}`);
                const response = await res.json();
                const data = response.detail || response.data || response;

                const genres = (data.genreList || data.genres || []).map((g: any) =>
                    typeof g === "string" ? g : g.title || g.name || g
                );

                const episodes: ProviderEpisode[] = (data.episode_list || data.episodeList || data.episodes || [])
                    .map((ep: any, idx: number) => {
                        let epSlug = ep.episodeId || ep.slug || `ep-${idx}`;
                        if (epSlug === "episode" && ep.url) {
                            const parts = ep.url.split('/').filter(Boolean);
                            epSlug = parts[parts.length - 1];
                        }
                        return {
                            id: epSlug,
                            number: ep.eps || ep.number || idx + 1,
                            title: ep.title || `Episode ${ep.eps || idx + 1}`,
                            urlSlug: epSlug,
                            date: ep.date,
                        };
                    })
                    .sort((a: ProviderEpisode, b: ProviderEpisode) => b.number - a.number);

                return {
                    id: slug,
                    slug,
                    title: data.title || slug,
                    poster: data.poster || data.image || "",
                    synopsis: data.synopsis?.paragraphs?.join("\n\n") || data.synopsis || "",
                    genres,
                    type: data.type || "TV",
                    status: data.info?.status || data.status || "Unknown",
                    totalEpisodes: episodes.length,
                    rating: data.score ? parseFloat(String(data.score)) : undefined,
                    episodes,
                };
            } catch (e) {
                console.error("[Oploverz] Detail Error:", e);
                throw new Error("Anime not found on Oploverz");
            }
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`oploverz_search_${query}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/search/${encodeURIComponent(query)}`, { headers: headers() });
                if (!res.ok) { console.error("[Oploverz] Search HTTP:", res.status); return { data: [] }; }
                const json = await res.json();

                const rawList = json?.anime_list;
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    return { data: [] };
                }

                const pagination = json?.pagination;
                return {
                    data: rawList.map(mapItem),
                    pagination: pagination ? {
                        currentPage: pagination.currentPage || 1,
                        hasNextPage: !!pagination.hasNext,
                        hasPrevPage: !!pagination.hasPrev,
                        totalPages: pagination.totalPages || 1,
                        lastVisiblePage: pagination.totalPages || 1,
                        items: { count: rawList.length, total: rawList.length, per_page: rawList.length },
                    } : undefined,
                };
            } catch (e) {
                console.error("[Oploverz] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getSchedule(): Promise<Record<string, ProviderAnime[]>> {
        return getCachedData("oploverz_schedule", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/schedule`, { headers: headers() });
                if (!res.ok) { console.error("[Oploverz] Schedule HTTP:", res.status); return {}; }
                const json = await res.json();
                
                const schedule = json.schedule;
                if (!schedule) return {};
                
                const result: Record<string, ProviderAnime[]> = {};
                for (const day in schedule) {
                    result[day] = schedule[day].map(mapItem);
                }
                
                return result;
            } catch (e) {
                console.error("[Oploverz] Schedule Error:", e);
                return {};
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`oploverz_stream_${episodeSlug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/episode/${episodeSlug}`, { headers: headers() });
                if (!res.ok) return [];
                const response = await res.json();
                const data = response.data || response;
                if (!data) return [];

                const servers: ProviderStreamServer[] = [];

                if (data.streams && Array.isArray(data.streams)) {
                    data.streams.forEach((st: any) => {
                        servers.push({
                            name: st.name || "Server",
                            quality: st.resolution || st.quality || "auto",
                            streamUrl: st.url || "",
                        });
                    });
                } else if (data.server?.qualities) {
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
                console.error("[Oploverz] Stream Error:", e);
                return [];
            }
        });
    },
};
