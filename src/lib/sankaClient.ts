
import { getCachedData } from "./cache";

const SANKA_API_BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";

// --- Types ---
export type SankaAnime = {
    id: string;
    slug: string;
    title: string;
    poster: string;
    synopsis: string;
    genres: string[];
    type: string;       // tv, movie, ova, etc.
    status: string;
    totalEpisodes?: number;
    rating?: number;    // from Sanka or fallback
    releaseDate?: string;
    studio?: string;
};

export type SankaEpisode = {
    id: string;
    number: number;
    title: string;
    urlSlug: string;
    date?: string;
};

export type SankaStreamServer = {
    name: string;       // e.g. "Otakudesu", "Samehadaku", "Zippy", etc.
    quality?: string;   // 480p, 720p, 1080p
    streamUrl: string;  // direct/iframe URL
};

export type SankaSearchResult = {
    title: string;
    thumb: string;
    id: string; // or link/slug
    type: string;
    status: string;
    score: string;
};

// --- API Client ---

export const sankaClient = {
    /**
     * Get home/trending anime
     */
    getHome: async (): Promise<SankaAnime[]> => {
        return getCachedData("sanka_home", async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/home`);
                if (!res.ok) {
                    console.error("Sanka Home Fetch Failed:", res.status);
                    return [];
                }
                const data = await res.json();

                // Actual structure: { data: { ongoing: { animeList: [...] }, completed: { animeList: [...] } } }
                // Combine both ongoing and completed anime
                const ongoingList = data.data?.ongoing?.animeList || [];
                const completedList = data.data?.completed?.animeList || [];
                const rawList = [...ongoingList, ...completedList];

                if (!Array.isArray(rawList) || rawList.length === 0) return [];

                return rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: [],
                    type: item.type || "TV",
                    status: item.status || (item.releaseDay ? "Ongoing" : "Completed"),
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                }));
            } catch (e) {
                console.error("Sanka Home Error:", e);
                return [];
            }
        });
    },

    /**
     * Get Ongoing Anime (Paginated)
     */
    getOngoing: async (page: number = 1): Promise<SankaAnime[]> => {
        return getCachedData(`sanka_ongoing_${page}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/ongoing-anime?page=${page}`);
                if (!res.ok) return [];
                const data = await res.json();
                // Actual structure: { data: { animeList: [...] } }
                const rawList = data.data?.animeList || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return [];

                return rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: [],
                    type: "TV",
                    status: "Ongoing",
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                }));
            } catch (e) {
                console.error("Sanka Ongoing Error:", e);
                return [];
            }
        });
    },

    /**
     * Get Completed Anime (Paginated)
     */
    getCompleted: async (page: number = 1): Promise<SankaAnime[]> => {
        return getCachedData(`sanka_completed_${page}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/complete-anime/${page}`);
                if (!res.ok) return [];
                const data = await res.json();
                // Actual structure: { data: { animeList: [...] } }
                const rawList = data.data?.animeList || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return [];

                return rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: [],
                    type: "TV",
                    status: "Completed",
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                }));
            } catch (e) {
                console.error("Sanka Completed Error:", e);
                return [];
            }
        });
    },

    /**
     * Search anime
     */
    search: async (query: string): Promise<SankaAnime[]> => {
        // Search usually shouldn't be heavily cached or short TTL, but acceptable for fuzzy terms
        return getCachedData(`sanka_search_${query}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/search/${encodeURIComponent(query)}`);
                if (!res.ok) return []; // Return empty on error or 404
                const data = await res.json();

                // Actual structure might be { data: { animeList: [...] } } or { data: [...] }
                const rawList = data.data?.animeList || data.data || [];
                if (!Array.isArray(rawList) || rawList.length === 0) return [];

                return rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: item.genres || [],
                    type: item.type || "TV",
                    status: item.status || "Unknown",
                    rating: item.score ? parseFloat(item.score) : undefined
                }));
            } catch (e) {
                console.error("Sanka Search Error:", e);
                return [];
            }
        });
    },

    /**
     * Get Anime Detail
     */
    getDetail: async (slug: string): Promise<SankaAnime & { episodes: SankaEpisode[] }> => {
        return getCachedData(`sanka_detail_${slug}`, async () => {
            try {
                // Docs: /anime/anime/{id} or /anime/detail/{id}
                const res = await fetch(`${SANKA_API_BASE}/anime/anime/${slug}`);
                if (!res.ok) throw new Error("Anime not found");
                const data = await res.json();

                // Normalize
                const anime: SankaAnime = {
                    id: data.id || slug,
                    slug: slug,
                    title: data.title,
                    poster: data.image || data.thumb || data.poster || "",
                    synopsis: data.synopsis || data.description || "",
                    genres: data.genres || [], // data.genres might be array of objects or strings
                    type: data.type || "TV",
                    status: data.status || "Unknown",
                    totalEpisodes: data.total_episode,
                    rating: data.score,
                    releaseDate: data.release,
                    studio: data.studio
                };

                const episodes: SankaEpisode[] = (data.episode_list || data.episodes || []).map((ep: any) => ({
                    id: ep.id || ep.slug || ep.link?.split('/').pop(),
                    number: parseFloat(ep.episode) || parseFloat(ep.title?.match(/(\d+)/)?.[0] || "0"),
                    title: ep.title,
                    urlSlug: ep.id || ep.slug || ep.link?.split('/').pop(),
                    date: ep.date
                })).sort((a: any, b: any) => b.number - a.number); // sort desc

                return { ...anime, episodes };
            } catch (e) {
                console.error("Sanka Detail Error:", e);
                throw e;
            }
        });
    },

    /**
     * Get Streaming Links
     */
    getStreams: async (episodeSlug: string): Promise<SankaStreamServer[]> => {
        return getCachedData(`sanka_stream_${episodeSlug}`, async () => {
            try {
                // Docs: /anime/episode/{id}
                const res = await fetch(`${SANKA_API_BASE}/anime/episode/${episodeSlug}`);
                if (!res.ok) throw new Error("Episode not found");
                const data = await res.json();

                // This endpoint likely returns the episode detail + stream links
                // Adaptation needed based on actual structure.
                // Assuming data.stream_link or data.servers

                const servers: SankaStreamServer[] = [];

                if (data.stream_link) {
                    // Direct link
                    servers.push({
                        name: "Default",
                        streamUrl: data.stream_link
                    });
                }

                if (data.servers && Array.isArray(data.servers)) {
                    data.servers.forEach((srv: any) => {
                        servers.push({
                            name: srv.name || srv.server,
                            quality: srv.quality,
                            streamUrl: srv.link || srv.url
                        });
                    });
                }

                // Fallback if data itself is the stream info (depending on how API behaves)
                if (servers.length === 0 && (data.link || data.url)) {
                    servers.push({
                        name: "Source",
                        streamUrl: data.link || data.url
                    });
                }

                return servers;
            } catch (e) {
                console.error("Sanka Stream Error:", e);
                return [];
            }
        });
    }
};
