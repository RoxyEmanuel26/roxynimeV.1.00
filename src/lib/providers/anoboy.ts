import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/anoboy";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

// Anoboy home item fields: title, poster, slug, episode, type, url
function mapItem(item: any): ProviderAnime {
    const slug = item.slug || "";
    return {
        id: slug,
        slug,
        title: item.title || "",
        poster: item.poster || "",
        synopsis: "",
        genres: [],
        type: item.type || "TV",
        status: "Ongoing",
        totalEpisodes: item.episode
            ? parseInt(String(item.episode).replace(/\D/g, ""))
            : undefined,
        rating: undefined,
    };
}

export const anoboyProvider: AnimeProvider = {
    info: {
        id: "anoboy",
        name: "Anoboy",
        description: "Nonton anime subtitle Indonesia",
        icon: "📺",
        language: "id",
        contentType: "Anime",
        features: {
            home: true,
            ongoing: true,
            completed: false,
            search: true,
            detail: true,
            streaming: true,
            schedule: false,
            genres: false,
            movies: false,
        },
    },

    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("anoboy_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) { console.error("[Anoboy] Home HTTP:", res.status); return []; }
                const json = await res.json();

                // Response: { anime_list: [...], pagination: {...} }
                const rawList = json?.anime_list;
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    console.warn("[Anoboy] No anime in anime_list");
                    return [];
                }

                return rawList.map(mapItem);
            } catch (e) {
                console.error("[Anoboy] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        const homeData = await this.getHome();
        return { data: homeData };
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        // Not supported — return home data
        const homeData = await this.getHome();
        return { data: homeData };
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`anoboy_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers() });
                if (!res.ok) throw new Error(`Anoboy detail failed: ${res.status}`);
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
                    type: data.type || "TV",
                    status: data.status || "Unknown",
                    totalEpisodes: episodes.length,
                    rating: data.score ? parseFloat(String(data.score)) : undefined,
                    episodes,
                };
            } catch (e) {
                console.error("[Anoboy] Detail Error:", e);
                throw new Error("Anime not found on Anoboy");
            }
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`anoboy_search_${query}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/search/${encodeURIComponent(query)}`, {
                    headers: headers(),
                });
                if (!res.ok) return { data: [] };
                const json = await res.json();

                // Try multiple possible response paths
                const rawList = json?.anime_list || json?.data || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem) };
            } catch (e) {
                console.error("[Anoboy] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`anoboy_stream_${episodeSlug}`, async () => {
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

                if (servers.length === 0 && (data.streaming_url || data.streamUrl || data.stream_link)) {
                    servers.push({
                        name: "Default", quality: "auto",
                        streamUrl: data.streaming_url || data.streamUrl || data.stream_link,
                    });
                }

                return servers;
            } catch (e) {
                console.error("[Anoboy] Stream Error:", e);
                return [];
            }
        });
    },
};
