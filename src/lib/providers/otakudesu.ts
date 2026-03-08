import {
    AnimeProvider, ProviderAnime, ProviderAnimeDetail, ProviderEpisode,
    ProviderStreamServer, ProviderInfo, PaginatedResponse
} from "./types";
import { getCachedData } from "../cache";

const SANKA_API_BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";

export const otakudesuProvider: AnimeProvider = {
    info: {
        id: "otakudesu",
        name: "Otakudesu",
        description: "Anime subtitle Indonesia — sumber utama",
        icon: "🎌",
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
        return getCachedData("otakudesu_home", async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/home`);
                if (!res.ok) return [];
                const data = await res.json();

                const ongoingList = data.data?.ongoing?.animeList || [];
                const completedList = data.data?.completed?.animeList || [];
                const rawList = [...ongoingList, ...completedList];

                if (!Array.isArray(rawList) || rawList.length === 0) return [];

                return rawList.map((item: any) => mapItem(item, "Ongoing"));
            } catch (e) {
                console.error("[Otakudesu] Home Error:", e);
                return [];
            }
        });
    },

    async getOngoing(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`otakudesu_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/ongoing-anime?page=${page}`, {
                    headers: defaultHeaders(),
                });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                const rawList = data.data?.animeList || [];
                const pagination = data.pagination || data.data?.pagination;
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const animeList = rawList
                    .map((item: any) => mapItem(item, "Ongoing"))
                    .filter((a: ProviderAnime) => !a.status || a.status.toLowerCase() === "ongoing");

                return { data: animeList, pagination };
            } catch (e) {
                console.error("[Otakudesu] Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    async getCompleted(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`otakudesu_completed_${page}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/complete-anime?page=${page}`, {
                    headers: defaultHeaders(),
                });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                const rawList = data.data?.animeList || [];
                const pagination = data.pagination || data.data?.pagination;
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const animeList = rawList.map((item: any) => mapItem(item, "Completed"));
                return { data: animeList, pagination };
            } catch (e) {
                console.error("[Otakudesu] Completed Error:", e);
                return { data: [] };
            }
        });
    },

    async getDetail(slug: string): Promise<ProviderAnimeDetail> {
        return getCachedData(`otakudesu_detail_${slug}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/anime/${slug}`);
                if (res.ok) {
                    const response = await res.json();
                    const data = response.data;

                    const genres = (data.genreList || []).map((g: any) => g.title || g);
                    const episodes: ProviderEpisode[] = (data.episodeList || [])
                        .map((ep: any) => ({
                            id: ep.episodeId,
                            number: ep.eps,
                            title: ep.title,
                            urlSlug: ep.episodeId,
                            date: ep.date,
                        }))
                        .sort((a: ProviderEpisode, b: ProviderEpisode) => b.number - a.number);

                    return {
                        id: slug,
                        slug,
                        title: data.title,
                        poster: data.poster || "",
                        synopsis: data.synopsis?.paragraphs?.join("\n\n") || "",
                        genres,
                        type: data.type || "TV",
                        status: data.status || "Unknown",
                        totalEpisodes: data.episodes,
                        rating: parseFloat(data.score) || undefined,
                        releaseDate: data.aired,
                        studio: data.studios,
                        japaneseTitle: data.japanese,
                        englishTitle: data.english,
                        season: data.season,
                        duration: data.duration,
                        source: data.source,
                        episodes,
                    };
                }
            } catch (e) {
                console.log(`[Otakudesu] Detail failed for ${slug}, trying Jikan...`);
            }

            // Jikan fallback
            return jikanFallback(slug);
        });
    },

    async search(query: string): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`otakudesu_search_${query}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/search/${encodeURIComponent(query)}`, {
                    headers: defaultHeaders(),
                });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                const rawList = data.data?.animeList || data.data || [];
                const pagination = data.pagination || data.data?.pagination;
                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                return {
                    data: rawList.map((item: any) => mapItem(item, "Unknown")),
                    pagination,
                };
            } catch (e) {
                console.error("[Otakudesu] Search Error:", e);
                return { data: [] };
            }
        });
    },

    async getStreams(episodeSlug: string): Promise<ProviderStreamServer[]> {
        return getCachedData(`otakudesu_stream_${episodeSlug}`, async () => {
            try {
                const url = `${SANKA_API_BASE}/anime/episode/${episodeSlug}`;
                const res = await fetch(url);
                if (!res.ok) return [];

                const response = await res.json();
                const data = response.data;
                if (!data) return [];

                return parseStreamServers(data);
            } catch (e) {
                console.error("[Otakudesu] Stream Error:", e);
                return [];
            }
        });
    },

    async getMovies(page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        const response = await this.search("movie");
        const filtered = response.data.filter((a) => {
            const t = a.type?.toLowerCase() || "";
            return t.includes("movie") || t.includes("film") || t === "unknown";
        });
        return { data: filtered, pagination: response.pagination };
    },

    async getByGenre(genre: string, page = 1): Promise<PaginatedResponse<ProviderAnime[]>> {
        return getCachedData(`otakudesu_genre_${genre}_${page}`, async () => {
            try {
                const apiPage1 = (page - 1) * 2 + 1;
                const apiPage2 = apiPage1 + 1;

                const fetchPage = async (p: number) => {
                    const url = `${SANKA_API_BASE}/anime/genre/${encodeURIComponent(genre)}?page=${p}`;
                    const res = await fetch(url, { headers: defaultHeaders() });
                    if (!res.ok) return [];
                    const data = await res.json();
                    return data.data?.animeList || data.data || [];
                };

                const [rawList1, rawList2] = await Promise.all([fetchPage(apiPage1), fetchPage(apiPage2)]);
                const rawList = [...rawList1, ...rawList2];

                if (!Array.isArray(rawList) || rawList.length === 0) {
                    return {
                        data: [],
                        pagination: {
                            currentPage: page,
                            hasNextPage: false,
                            hasPrevPage: page > 1,
                            lastVisiblePage: page,
                            items: { count: 0, total: 0, per_page: 30 },
                        },
                    };
                }

                const animeList = rawList.map((item: any) => mapItem(item, "Unknown"));

                return {
                    data: animeList,
                    pagination: {
                        currentPage: page,
                        hasNextPage: rawList2.length >= 15,
                        hasPrevPage: page > 1,
                        lastVisiblePage: rawList2.length >= 15 ? page + 1 : page,
                        items: { count: rawList.length, total: rawList.length, per_page: 30 },
                    },
                };
            } catch (e) {
                console.error("[Otakudesu] Genre Error:", e);
                return { data: [] };
            }
        });
    },
};

// --- Helpers ---

function defaultHeaders() {
    return {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
    };
}

function mapItem(item: any, defaultStatus: string): ProviderAnime {
    const validId = item.animeId || item.slug || item.id || `anime-${(item.title || "").replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    return {
        id: validId,
        slug: validId,
        title: item.title || "",
        poster: item.poster || item.image || item.thumb || "",
        synopsis: item.synopsis || "",
        genres: item.genres || item.genre || [],
        type: item.type || "TV",
        status: item.status || defaultStatus,
        totalEpisodes: item.episodes || item.episode || item.total_episode,
        rating: item.score ? parseFloat(item.score) : undefined,
    };
}

function parseStreamServers(data: any): ProviderStreamServer[] {
    const servers: ProviderStreamServer[] = [];

    if (data.server?.qualities) {
        data.server.qualities.forEach((qg: any) => {
            const quality = qg.title || "default";
            if (Array.isArray(qg.serverList)) {
                qg.serverList.forEach((srv: any) => {
                    let streamUrl = srv.href || srv.url || srv.serverId;
                    if (streamUrl?.startsWith("/")) streamUrl = `${SANKA_API_BASE}${streamUrl}`;
                    else if (srv.serverId) streamUrl = `${SANKA_API_BASE}/anime/server/${srv.serverId}`;
                    servers.push({ name: srv.title || srv.name || "Server", quality, streamUrl });
                });
            }
        });
    } else if (data.mirror) {
        Object.entries(data.mirror).forEach(([quality, serverList]) => {
            if (Array.isArray(serverList)) {
                (serverList as any[]).forEach((srv) => {
                    let streamUrl = srv.href || srv.url || srv.serverId;
                    if (streamUrl?.startsWith("/")) streamUrl = `${SANKA_API_BASE}${streamUrl}`;
                    else if (srv.serverId) streamUrl = `${SANKA_API_BASE}/anime/server/${srv.serverId}`;
                    servers.push({ name: srv.title || srv.name || "Server", quality, streamUrl });
                });
            }
        });
    } else if (data.defaultStreamingUrl) {
        servers.push({ name: "Default", quality: "auto", streamUrl: data.defaultStreamingUrl });
    } else {
        if (data.streamList && Array.isArray(data.streamList)) {
            data.streamList.forEach((srv: any) => {
                servers.push({
                    name: srv.server || srv.name || "Unknown",
                    quality: srv.quality || srv.resolution,
                    streamUrl: srv.url || srv.link || "",
                });
            });
        }
        if (data.stream_link) {
            servers.push({ name: "Default", quality: "default", streamUrl: data.stream_link });
        }
    }

    return servers;
}

async function jikanFallback(slug: string): Promise<ProviderAnimeDetail> {
    try {
        const searchTerm = slug
            .replace(/-sub-indo$/i, "")
            .replace(/-episode-\d+$/i, "")
            .replace(/-/g, " ")
            .trim();

        const jikanRes = await fetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=1`
        );

        if (jikanRes.ok) {
            const jikanData = await jikanRes.json();
            const match = jikanData.data?.[0];
            if (match) {
                return {
                    id: slug,
                    slug,
                    title: match.title || match.title_english || searchTerm,
                    poster: match.images?.jpg?.large_image_url || match.images?.jpg?.image_url || "",
                    synopsis: match.synopsis || "",
                    genres: (match.genres || []).map((g: any) => g.name),
                    type: match.type || "TV",
                    status: match.status || "Unknown",
                    totalEpisodes: match.episodes,
                    rating: match.score,
                    releaseDate: match.aired?.string,
                    studio: (match.studios || []).map((s: any) => s.name).join(", "),
                    episodes: [],
                };
            }
        }
    } catch (e) {
        console.error("[Jikan] Fallback failed:", e);
    }
    throw new Error("Anime not found");
}
