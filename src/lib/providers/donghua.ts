import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/donghua";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

// Donghua home item fields: title, poster, slug, type, status, current_episode, href, anichinUrl
function mapItem(item: any): ProviderAnime {
    const slug = item.slug || "";
    return {
        id: slug,
        slug,
        title: item.title || "",
        poster: item.poster || "",
        synopsis: "",
        genres: [],
        type: item.type || "Donghua",
        status: item.status || "Ongoing",
        totalEpisodes: item.current_episode
            ? parseInt(String(item.current_episode).replace(/\D/g, ""))
            : undefined,
        rating: undefined,
    };
}

export const donghuaProvider: AnimeProvider = {
    info: {
        id: "donghua",
        name: "Donghua",
        description: "Animasi Tiongkok / Chinese Animation",
        icon: "🐉",
        language: "zh",
        contentType: "Donghua",
        features: {
            home: true,
            ongoing: true,
            completed: true,
            search: true,
            detail: true,
            streaming: true,
            schedule: false,
            genres: true,
            movies: false,
        },
    },

    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("donghua_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) { console.error("[Donghua] Home HTTP:", res.status); return []; }
                const json = await res.json();

                // Response: { latest_release: [...], completed_donghua: [...] }
                const latestList = json?.latest_release || [];
                const completedList = json?.completed_donghua || [];
                const rawList = [...latestList, ...completedList];

                if (!Array.isArray(rawList) || rawList.length === 0) {
                    console.warn("[Donghua] No anime in latest_release/completed_donghua");
                    return [];
                }

                return rawList.map(mapItem);
            } catch (e) {
                console.error("[Donghua] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData("donghua_ongoing", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                const rawList = json?.latest_release || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem) };
            } catch (e) {
                console.error("[Donghua] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData("donghua_completed", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                const rawList = json?.completed_donghua || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem) };
            } catch (e) {
                console.error("[Donghua] Completed Error:", e);
                return { data: [] };
            }
        });
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`donghua_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers() });
                if (!res.ok) throw new Error(`Donghua detail failed: ${res.status}`);
                const response = await res.json();
                const data = response.data || response;

                const genres = (data.genreList || data.genres || []).map((g: any) =>
                    typeof g === "string" ? g : g.title || g.name || g
                );

                const episodes: ProviderEpisode[] = (data.episodeList || data.episodes || [])
                    .map((ep: any, idx: number) => ({
                        id: ep.episodeId || ep.slug || `ep-${idx}`,
                        number: ep.eps || ep.number || idx + 1,
                        title: ep.title || `Episode ${ep.eps || idx + 1}`,
                        urlSlug: ep.episodeId || ep.slug || "",
                        date: ep.date,
                    }))
                    .sort((a: ProviderEpisode, b: ProviderEpisode) => b.number - a.number);

                return {
                    id: slug,
                    slug,
                    title: data.title || slug,
                    poster: data.poster || data.image || "",
                    synopsis: data.synopsis?.paragraphs?.join("\n\n") || data.synopsis || "",
                    genres,
                    type: "Donghua",
                    status: data.status || "Ongoing",
                    totalEpisodes: episodes.length,
                    rating: data.score ? parseFloat(String(data.score)) : undefined,
                    releaseDate: data.aired || data.release,
                    studio: data.studios || data.studio,
                    episodes,
                };
            } catch (e) {
                console.error("[Donghua] Detail Error:", e);
                throw new Error("Donghua not found");
            }
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`donghua_search_${query}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/search/${encodeURIComponent(query)}`, {
                    headers: headers(),
                });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                // Try multiple possible paths
                const rawList = json?.data?.animeList || json?.data || json?.results || json?.anime_list || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem) };
            } catch (e) {
                console.error("[Donghua] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`donghua_stream_${episodeSlug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/episode/${episodeSlug}`, { headers: headers() });
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

                if (servers.length === 0 && (data.streaming_url || data.streamUrl)) {
                    servers.push({ name: "Default", quality: "auto", streamUrl: data.streaming_url || data.streamUrl });
                }

                return servers;
            } catch (e) {
                console.error("[Donghua] Stream Error:", e);
                return [];
            }
        });
    },

    async getByGenre(genre: string, page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`donghua_genre_${genre}_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/genres/${encodeURIComponent(genre)}?page=${page}`, {
                    headers: headers(),
                });
                if (!res.ok) return { data: [] };
                const json = await res.json();
                const rawList = json?.data?.animeList || json?.data || [];
                if (!Array.isArray(rawList)) return { data: [] };
                return { data: rawList.map(mapItem), pagination: json.pagination };
            } catch (e) {
                console.error("[Donghua] Genre Error:", e);
                return { data: [] };
            }
        });
    },
};
