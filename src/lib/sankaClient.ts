
import { getCachedData } from "./cache";

const SANKA_API_BASE = process.env.SANKA_API_BASE || "https://www.sankavollerei.com";
const isDev = process.env.NODE_ENV === "development";

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

export interface PaginationInfo {
    currentPage: number;
    lastVisiblePage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages?: number; // Added to support direct totalPages from API
    items: {
        count: number;
        total: number;
        per_page: number;
    };
}

export interface PaginatedResponse<T> {
    data: T;
    pagination?: PaginationInfo;
}

// --- API Client ---

export const sankaClient = {
    /**
     * Get home/trending anime
     */
    getHome: async (): Promise<SankaAnime[]> => {
        return getCachedData("sanka_home_v2", async () => {
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
    getOngoing: async (page: number = 1): Promise<PaginatedResponse<SankaAnime[]>> => {
        return getCachedData(`sanka_ongoing_v5_${page}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/ongoing-anime?page=${page}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json"
                    }
                });
                if (!res.ok) return { data: [] };
                const data = await res.json();

                // Actual structure: { data: { animeList: [...] } }
                const rawList = data.data?.animeList || [];
                const pagination = data.pagination || data.data?.pagination;

                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const animeList = rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: item.genres || item.genre || [],
                    type: "TV",
                    status: item.status || "Ongoing", // Keep original status if available
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                })).filter((item: any) => {
                    // FIXED: less strict ongoing filter
                    const s = (item.status || "").toLowerCase().trim();
                    if (!s) return true;
                    return (
                        s.includes("ongoing") ||
                        s.includes("airing") ||
                        s.includes("tayang") ||
                        s.includes("belum tamat")
                    );
                });

                return { data: animeList, pagination };
            } catch (e) {
                console.error("Sanka Ongoing Error:", e);
                return { data: [] };
            }
        });
    },

    /**
     * Get Completed Anime (Paginated)
     */
    getCompleted: async (page: number = 1): Promise<PaginatedResponse<SankaAnime[]>> => {
        return getCachedData(`sanka_completed_v4_${page}`, async () => {
            try {
                const url = `${SANKA_API_BASE}/anime/complete-anime?page=${page}`;

                const res = await fetch(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json"
                    }
                });

                if (!res.ok) return { data: [] };

                const data = await res.json();
                const rawList = data.data?.animeList || [];

                const pagination = data.pagination || data.data?.pagination;

                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const animeList = rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: item.genres || item.genre || [],
                    type: "TV",
                    status: "Completed",
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                })).filter((item: any) => {
                    // FIXED: less strict completed filter
                    const s = (item.status || "").toLowerCase().trim();
                    if (!s) return true;
                    return (
                        s.includes("completed") ||
                        s.includes("complete") ||
                        s.includes("finished") ||
                        s.includes("tamat") ||
                        s.includes("selesai")
                    );
                });

                return { data: animeList, pagination };
            } catch (e) {
                console.error("Sanka Completed Error:", e);
                return { data: [] };
            }
        });
    },

    /**
     * Get Anime by Genre (Paginated) - fetches 2 API pages to get ~25 items
     */
    getByGenre: async (genre: string, page: number = 1): Promise<PaginatedResponse<SankaAnime[]>> => {
        return getCachedData(`sanka_genre_v2_${genre}_${page}`, async () => {
            try {
                // API returns 15 items per page, so fetch 2 pages to get ~25 items
                const apiPage1 = (page - 1) * 2 + 1; // Page 1 -> API pages 1,2; Page 2 -> API pages 3,4
                const apiPage2 = apiPage1 + 1;

                const fetchPage = async (p: number) => {
                    const url = `${SANKA_API_BASE}/anime/genre/${encodeURIComponent(genre)}?page=${p}`;
                    const res = await fetch(url, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                            "Accept": "application/json"
                        }
                    });
                    if (!res.ok) return [];
                    const data = await res.json();
                    return data.data?.animeList || data.data || [];
                };

                // Fetch both pages in parallel
                const [rawList1, rawList2] = await Promise.all([
                    fetchPage(apiPage1),
                    fetchPage(apiPage2)
                ]);

                const rawList = [...rawList1, ...rawList2];

                // If both pages are empty, return empty with no next page
                if (!Array.isArray(rawList) || rawList.length === 0) {
                    return {
                        data: [],
                        pagination: {
                            currentPage: page,
                            hasNextPage: false,
                            hasPrevPage: page > 1,
                            lastVisiblePage: page,
                            items: { count: 0, total: 0, per_page: 30 }
                        }
                    };
                }

                const animeList = rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: item.genres || item.genre || [],
                    type: item.type || "TV",
                    status: item.status || "Unknown",
                    totalEpisodes: item.episodes || item.episode || item.total_episode,
                    rating: item.score ? parseFloat(item.score) : undefined
                }));

                // FIXED: More conservative pagination estimation
                const hasMore = rawList1.length > 0 || rawList2.length > 0;
                const paginationInfo = {
                    currentPage: page,
                    hasNextPage: hasMore && (rawList1.length >= 14 || rawList2.length > 0),
                    hasPrevPage: page > 1,
                    lastVisiblePage: hasMore ? page + 1 : page,
                    items: { count: rawList.length, total: rawList.length, per_page: 30 }
                };

                return { data: animeList, pagination: paginationInfo };
            } catch (e) {
                console.error("Sanka Genre Error:", e);
                return { data: [] };
            }
        });
    },

    /**
     * Search anime
     */
    search: async (query: string): Promise<PaginatedResponse<SankaAnime[]>> => {
        // Search usually shouldn't be heavily cached or short TTL, but acceptable for fuzzy terms
        return getCachedData(`sanka_search_v5_${query}`, async () => {
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/search/${encodeURIComponent(query)}`, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json"
                    }
                });
                if (!res.ok) return { data: [] }; // Return empty on error or 404
                const data = await res.json();

                // Actual structure might be { data: { animeList: [...] } } or { data: [...] }
                const rawList = data.data?.animeList || data.data || [];
                const pagination = data.pagination || data.data?.pagination;

                if (!Array.isArray(rawList) || rawList.length === 0) return { data: [] };

                const animeList = rawList.map((item: any) => ({
                    id: item.animeId || item.id || item.slug,
                    slug: item.animeId || item.slug || item.id,
                    title: item.title,
                    poster: item.poster || item.image || item.thumb || "",
                    synopsis: "",
                    genres: item.genres || [],
                    type: item.type || "Unknown", // Default to Unknown so filters can decide
                    status: item.status || "Unknown",
                    rating: item.score ? parseFloat(item.score) : undefined
                }));

                return { data: animeList, pagination };
            } catch (e) {
                console.error("Sanka Search Error:", e);
                return { data: [] };
            }
        });
    },

    /**
     * Get Anime Detail
     */
    getDetail: async (slug: string): Promise<SankaAnime & { episodes: SankaEpisode[] }> => {
        return getCachedData(`sanka_detail_v3_${slug}`, async () => {
            // Try Sanka API first
            try {
                const res = await fetch(`${SANKA_API_BASE}/anime/anime/${slug}`);
                if (res.ok) {
                    const response = await res.json();
                    const data = response.data;

                    // Extract genres from genreList
                    const genres = (data.genreList || []).map((g: any) => g.title || g);

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

                    const episodes: SankaEpisode[] = (data.episodeList || []).map((ep: any) => ({
                        id: ep.episodeId,
                        number: ep.eps,
                        title: ep.title,
                        urlSlug: ep.episodeId,
                        date: ep.date
                    })).sort((a: any, b: any) => b.number - a.number);

                    if (isDev) console.log(`✅ [Sanka] Found anime: ${anime.title}`);
                    return { ...anime, episodes };
                }
            } catch (e) {
                if (isDev) console.log(`⚠️ [Sanka] Failed for ${slug}, trying Jikan fallback...`);
            }

            // Fallback to Jikan API (MyAnimeList)
            try {
                if (isDev) console.log(`🔄 [Jikan] Searching for: ${slug}`);

                // Extract search term from slug (remove sub-indo, episode numbers etc)
                const searchTerm = slug
                    .replace(/-sub-indo$/i, '')
                    .replace(/-episode-\d+$/i, '')
                    .replace(/-/g, ' ')
                    .trim();

                const jikanRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=1`);

                if (jikanRes.ok) {
                    const jikanData = await jikanRes.json();
                    const match = jikanData.data?.[0];

                    if (match) {
                        if (isDev) console.log(`✅ [Jikan] Found: ${match.title}`);

                        const anime: SankaAnime = {
                            id: slug,
                            slug: slug,
                            title: match.title || match.title_english || searchTerm,
                            poster: match.images?.jpg?.large_image_url || match.images?.jpg?.image_url || "",
                            synopsis: match.synopsis || "",
                            genres: (match.genres || []).map((g: any) => g.name),
                            type: match.type || "TV",
                            status: match.status || "Unknown",
                            totalEpisodes: match.episodes,
                            rating: match.score,
                            releaseDate: match.aired?.string,
                            studio: (match.studios || []).map((s: any) => s.name).join(', ')
                        };

                        // Jikan doesn't have streaming episodes, return empty array
                        // User can still see anime info but won't be able to stream
                        return { ...anime, episodes: [] };
                    }
                }
            } catch (e) {
                console.error("❌ [Jikan] Fallback failed:", e);
            }

            // If both APIs fail, throw error
            throw new Error("Anime not found in both Sanka and Jikan APIs");
        });
    },

    /**
     * Get Streaming Links
     */
    getStreams: async (episodeSlug: string): Promise<SankaStreamServer[]> => {
        return getCachedData(`sanka_stream_v2_${episodeSlug}`, async () => {
            try {
                if (isDev) console.log("🌐 [SankaClient] getStreams called with:", episodeSlug);

                // Docs: /anime/episode/{id}
                const url = `${SANKA_API_BASE}/anime/episode/${episodeSlug}`;
                if (isDev) console.log(`📞 [SankaClient] Fetching from: ${url}`);

                const res = await fetch(url);

                if (isDev) console.log("📥 [SankaClient] Response status:", res.status);

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
                if (isDev) {
                    console.log('=== SANKA STREAMING RAW RESPONSE ===');
                    console.log('Episode Slug:', episodeSlug);
                    console.log('Response keys:', Object.keys(response));
                    console.log('Response data keys:', response.data ? Object.keys(response.data) : 'NO DATA');
                    console.log('Full response:', JSON.stringify(response, null, 2));
                    console.log('====================================');
                }

                // CRITICAL: API returns nested structure { data: { data: {...} } }
                const data = response.data;

                if (!data) {
                    console.error('No data in streaming response');
                    return [];
                }

                const servers: SankaStreamServer[] = [];

                // === NEW PARSING LOGIC === 
                // 1. Check for 'server.qualities' (NEW FORMAT from actual API)
                if (data.server && data.server.qualities) {
                    if (isDev) console.log("📀 [SankaClient] Processing server.qualities data...");

                    data.server.qualities.forEach((qualityGroup: any) => {
                        const quality = qualityGroup.title || "default"; // e.g., "360p", "480p", "720p"

                        if (Array.isArray(qualityGroup.serverList)) {
                            qualityGroup.serverList.forEach((srv: any) => {
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
                                    quality: quality,
                                    streamUrl: streamUrl
                                });
                            });
                        }
                    });
                }

                // 2. FALLBACK: Check for 'mirror' field (OLD FORMAT)
                else if (data.mirror) {
                    if (isDev) console.log("📀 [SankaClient] Processing mirror data (old format)...");
                    Object.entries(data.mirror).forEach(([quality, serverList]) => {
                        if (Array.isArray(serverList)) {
                            serverList.forEach((srv: any) => {
                                let streamUrl = srv.href || srv.url || srv.serverId;

                                if (streamUrl && streamUrl.startsWith('/')) {
                                    streamUrl = `${SANKA_API_BASE}${streamUrl}`;
                                } else if (srv.serverId) {
                                    streamUrl = `${SANKA_API_BASE}/anime/server/${srv.serverId}`;
                                }

                                servers.push({
                                    name: srv.title || srv.name || 'Server',
                                    quality: quality,
                                    streamUrl: streamUrl
                                });
                            });
                        }
                    });
                }

                // 3. FALLBACK: Use defaultStreamingUrl if available
                else if (data.defaultStreamingUrl) {
                    if (isDev) console.log("📀 [SankaClient] Using defaultStreamingUrl...");
                    servers.push({
                        name: "Default",
                        quality: "auto",
                        streamUrl: data.defaultStreamingUrl
                    });
                }

                // 4. FALLBACK: check for streamList/stream_link
                else {
                    if (isDev) console.log("⚠️ [SankaClient] No server data, trying other fallbacks...");

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

                if (isDev) {
                    console.log('=== PARSED STREAMS ===');
                    console.log('🎬 Stream count:', servers.length);
                    if (servers.length > 0) {
                        servers.forEach((s, idx) => {
                            console.log(`   Server ${idx + 1}:`, {
                                name: s.name,
                                quality: s.quality,
                                hasUrl: !!s.streamUrl
                            });
                        });
                    } else {
                        console.warn('⚠️ No streams parsed from response!');
                    }
                    console.log('======================');
                }

                return servers;
            } catch (e) {
                console.error("💥 [SankaClient] Stream Error:", e);
                return [];
            }
        });
    }
    /**
 * Get Streaming Links
 */


};