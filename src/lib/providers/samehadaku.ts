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

function mapItem(item: any): ProviderAnime {
    const id = item.animeId || item.slug || item.id || "";
    return {
        id,
        slug: id,
        title: item.title || "",
        poster: item.poster || item.image || item.thumb || "",
        synopsis: "",
        genres: item.genres || [],
        type: item.type || "TV",
        status: item.status || "Ongoing",
        totalEpisodes: item.episodes ? parseInt(item.episodes) : undefined,
        rating: item.score ? parseFloat(item.score) : undefined,
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
            completed: false,
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
                const res = await fetch(`${BASE}${PREFIX}/home`, { headers: headers() });
                if (!res.ok) return [];
                const data = await res.json();

                // Structure: data.recent.animeList[] OR data.ongoing.animeList[]
                const recentList = data.data?.recent?.animeList || [];
                const ongoingList = data.data?.ongoing?.animeList || [];
                const rawList = recentList.length > 0 ? recentList : ongoingList;

                if (!Array.isArray(rawList)) return [];
                return rawList.map(mapItem);
            } catch (e) {
                console.error("[Samehadaku] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`samehadaku_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/ongoing?page=${page}`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                const rawList = data.data?.animeList || data.data || [];
                const pagination = data.pagination;
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem), pagination };
            } catch (e) {
                console.error("[Samehadaku] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        // Samehadaku doesn't have a dedicated completed endpoint — use search
        return { data: [] };
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`samehadaku_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/anime/${slug}`, { headers: headers() });
                if (!res.ok) throw new Error(`Detail fetch failed: ${res.status}`);
                const response = await res.json();
                const data = response.data;

                const genres = (data.genreList || []).map((g: any) => g.title || g);
                const episodes: ProviderEpisode[] = (data.episodeList || [])
                    .map((ep: any) => ({
                        id: ep.episodeId || ep.slug || "",
                        number: typeof ep.title === "number" ? ep.title : parseInt(ep.title) || 0,
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
                const data = await res.json();

                const rawList = data.data?.animeList || data.data || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem), pagination: data.pagination };
            } catch (e) {
                console.error("[Samehadaku] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`samehadaku_stream_${episodeSlug}`, async () => {
            try {
                const res = await fetch(`${BASE}${PREFIX}/episode/${episodeSlug}`, { headers: headers() });
                if (!res.ok) return [];
                const response = await res.json();
                const data = response.data;
                if (!data) return [];

                const servers: ProviderStreamServer[] = [];

                // Parse server/qualities structure
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

                // Fallback: defaultStreamingUrl
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
                const res = await fetch(`${BASE}${PREFIX}/movies?page=${page}`, { headers: headers() });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                const rawList = data.data?.animeList || data.data || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem), pagination: data.pagination };
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
                const data = await res.json();

                const rawList = data.data?.animeList || data.data || [];
                if (!Array.isArray(rawList)) return { data: [] };

                return { data: rawList.map(mapItem), pagination: data.pagination };
            } catch (e) {
                console.error("[Samehadaku] Genre Error:", e);
                return { data: [] };
            }
        });
    },
};
