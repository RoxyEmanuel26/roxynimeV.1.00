
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
                const response = await res.json();

                // DEBUG: Log raw response
                console.log('=== SANKA API RAW RESPONSE ===');
                console.log('Slug:', slug);
                console.log('Response keys:', Object.keys(response));
                console.log('Response data:', JSON.stringify(response, null, 2));
                console.log('================================');

                // CRITICAL: API returns nested structure { data: { data: {...} } }
                const data = response.data;

                // Extract genres from genreList
                const genres = (data.genreList || []).map((g: any) => g.title || g);

                // Normalize
                const anime: SankaAnime = {
                    id: slug,
                    slug: slug,
                    title: data.title,
                    poster: data.poster || "",
                    synopsis: data.synopsis?.paragraphs?.join('\n\n') || "",
                    genres: genres,
                    type: data.type || "TV",
                    status: data.status || "Unknown",
                    totalEpisodes: data.episodes,
                    rating: parseFloat(data.score) || undefined,
                    releaseDate: data.aired,
                    studio: data.studios
                };

                // Parse episodes from episodeList
                const episodes: SankaEpisode[] = (data.episodeList || []).map((ep: any) => ({
                    id: ep.episodeId,
                    number: ep.eps,
                    title: ep.title,
                    urlSlug: ep.episodeId,
                    date: ep.date
                })).sort((a: any, b: any) => b.number - a.number); // sort desc

                console.log('=== PARSED ANIME ===');
                console.log('Title:', anime.title);
                console.log('Poster:', anime.poster);
                console.log('Episodes count:', episodes.length);
                console.log('First episode:', episodes[0]);
                console.log('====================');

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
                // Docs: /anime/episode/{id}
                const url = `${SANKA_API_BASE}/anime/episode/${episodeSlug}`;
                const res = await fetch(url);
                if (!res.ok) {
                    console.error(`Sanka Stream Fetch Failed for ${url}: ${res.status} ${res.statusText}`);
                    try {
                        const errorBody = await res.text();
                        console.error('Error Body:', errorBody);
                    } catch (e) { /* ignore */ }
                    throw new Error(`Episode not found: ${res.status}`);
                }
                const response = await res.json();

                // DEBUG: Log raw response
                console.log('=== SANKA STREAMING RAW RESPONSE ===');
                console.log('Episode Slug:', episodeSlug);
                console.log('Response keys:', Object.keys(response));
                console.log('Response data:', JSON.stringify(response, null, 2));
                console.log('====================================');

                // CRITICAL: API returns nested structure { data: { data: {...} } }
                const data = response.data;

                if (!data) {
                    console.error('No data in streaming response');
                    return [];
                }

                const servers: SankaStreamServer[] = [];

                // 1. Check for 'mirror' field (Confirmed source)
                // Structure: { "mirror": { "720p": [ { "title": "mega", "href": "/anime/server/..." } ] } }
                if (data.mirror) {
                    Object.entries(data.mirror).forEach(([quality, serverList]) => {
                        if (Array.isArray(serverList)) {
                            serverList.forEach((srv: any) => {
                                let streamUrl = srv.href || srv.url || srv.serverId;

                                // Handle relative URLs for server endpoints
                                if (streamUrl && streamUrl.startsWith('/')) {
                                    streamUrl = `${SANKA_API_BASE}${streamUrl}`;
                                } else if (srv.serverId) {
                                    // Construct URL if we have serverId
                                    streamUrl = `${SANKA_API_BASE}/anime/server/${srv.serverId}`;
                                }

                                servers.push({
                                    name: srv.title || srv.name || 'Server',
                                    quality: quality, // e.g., "720p", "480p", "mkv"
                                    streamUrl: streamUrl
                                });
                            });
                        }
                    });
                }

                // 2. Fallback: check for streamList/servers/stream_link
                if (servers.length === 0) {
                    if (data.streamList && Array.isArray(data.streamList)) {
                        data.streamList.forEach((srv: any) => {
                            servers.push({
                                name: srv.server || srv.name || 'Unknown',
                                quality: srv.quality || srv.resolution,
                                streamUrl: srv.url || srv.link || ''
                            });
                        });
                    }

                    if (data.stream_link) {
                        servers.push({
                            name: "Default",
                            quality: "default",
                            streamUrl: data.stream_link
                        });
                    }
                }

                console.log('=== PARSED STREAMS ===');
                console.log('Stream count:', servers.length);
                console.log('Servers:', servers);
                console.log('======================');

                return servers;
            } catch (e) {
                console.error("Sanka Stream Error:", e);
                return [];
            }
        });
    }
};
