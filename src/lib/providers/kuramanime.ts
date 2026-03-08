import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const PREFIX = "/anime/kuramanime";

const headers = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
});

function mapItem(item: any): ProviderAnime {
    const slug = item.animeId || item.slug || item.id || "";
    return {
        id: slug,
        slug,
        title: item.title || "",
        poster: item.poster || item.image || item.thumb || "",
        synopsis: "",
        genres: item.genres || [],
        type: item.type || "TV",
        status: item.status || "Ongoing",
        totalEpisodes: item.episodes ? parseInt(String(item.episodes)) : undefined,
        rating: item.score ? parseFloat(item.score) : undefined,
    };
}

export const kuramanimeProvider: AnimeProvider = {
    info: {
        id: "kuramanime",
        name: "Kuramanime",
        description: "Situs streaming anime sub Indonesia",
        icon: "🌸",
        language: "id",
        contentType: "Anime",
        features: {
            home: true,
            ongoing: true,
            completed: false,
            search: false,
            detail: true,
            streaming: true,
            schedule: false,
            genres: false,
            movies: false,
        },
    },

    async getHome(): Promise<ProviderAnime[]> {
        return getCachedData("kuramanime_home", async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) return [];
                const data = await res.json();

                const rawList = data.data?.animeList || data.data?.recent || data.data || [];
                if (!Array.isArray(rawList)) return [];

                return rawList.map(mapItem);
            } catch (e) {
                console.error("[Kuramanime] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        const homeData = await this.getHome();
        return { data: homeData };
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return { data: [] };
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`kuramanime_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers() });
                if (!res.ok) throw new Error(`Kuramanime detail failed: ${res.status}`);
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
                    rating: data.score ? parseFloat(data.score) : undefined,
                    episodes,
                };
            } catch (e) {
                console.error("[Kuramanime] Detail Error:", e);
                throw new Error("Anime not found on Kuramanime");
            }
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        // Kuramanime doesn't have a dedicated search endpoint
        return { data: [] };
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`kuramanime_stream_${episodeSlug}`, async () => {
            try {
                // Kuramanime uses /kura/watch/:id/:slug/:episode format
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
                                let streamUrl = srv.href || srv.url || srv.serverId;
                                if (streamUrl?.startsWith("/")) streamUrl = `${BASE}${streamUrl}`;
                                else if (srv.serverId) streamUrl = `${BASE}/anime/server/${srv.serverId}`;
                                servers.push({ name: srv.title || srv.name || "Server", quality, streamUrl });
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
                console.error("[Kuramanime] Stream Error:", e);
                return [];
            }
        });
    },
};
