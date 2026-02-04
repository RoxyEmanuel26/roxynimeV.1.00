import { sankaClient, SankaAnime, SankaEpisode, SankaStreamServer } from "./sankaClient";

// Interfaces to match the UI expectations
export interface Anime {
    id: string;
    slug?: string;
    title: string;
    image: string;
    poster?: string;
    episode?: number | string;
    type?: string;
    genres?: string[];
    status?: string;
    description?: string;
    rating?: string;
    released?: string;
    studio?: string;
    season?: string;
    synopsis?: string;
    japaneseTitle?: string;
}

export type AnimeDetail = Anime & {
    episodes: Episode[];
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
    urlSlug?: string;
}

export interface StreamingData {
    url: string;
    headers?: Record<string, string>;
    servers?: SankaStreamServer[];
}

// Wrapper functions using Sanka Client
export async function getTrendingAnime(): Promise<Anime[]> {
    const data = await sankaClient.getHome();
    return data.map(mapSankaToAnime);
}

export async function getOngoingAnimeList(page: number = 1): Promise<Anime[]> {
    const data = await sankaClient.getOngoing(page);
    return data.map(mapSankaToAnime);
}

export async function getCompletedAnimeList(page: number = 1): Promise<Anime[]> {
    const data = await sankaClient.getCompleted(page);
    return data.map(mapSankaToAnime);
}

export async function getMoviesList(page: number = 1): Promise<Anime[]> {
    const data = await sankaClient.search("movie");
    return data.map(mapSankaToAnime);
}

export async function getAnimeInfo(id: string): Promise<AnimeDetail> {
    const data = await sankaClient.getDetail(id);
    return {
        ...mapSankaToAnime(data),
        episodes: data.episodes.map(ep => ({
            id: ep.urlSlug || ep.id,
            number: ep.number,
            title: ep.title,
            urlSlug: ep.urlSlug
        }))
    };
}

export async function getEpisodeStreams(episodeId: string): Promise<StreamingData | null> {
    try {
        console.log("🔍 [animbus] Getting streams for episode:", episodeId);

        const servers = await sankaClient.getStreams(episodeId);

        console.log("📡 [animbus] Servers received:", servers);
        console.log("📊 [animbus] Number of servers:", servers?.length || 0);

        if (!servers || !servers.length) {
            console.warn("⚠️ [animbus] No servers found for:", episodeId);
            return null;
        }

        // Log all available servers
        servers.forEach((server, idx) => {
            console.log(`   Server ${idx + 1}:`, {
                name: server.name,
                quality: server.quality,
                hasUrl: !!server.streamUrl
            });
        });

        return {
            url: servers[0].streamUrl,
            headers: {},
            servers: servers // Pass all servers for selection
        };
    } catch (e) {
        console.error("❌ [animbus] Error getting stream:", e);
        return null;
    }
}

export async function searchAnimes(query: string): Promise<Anime[]> {
    const data = await sankaClient.search(query);
    return data.map(mapSankaToAnime);
}

// Helper mapper
function mapSankaToAnime(sanka: SankaAnime): Anime {
    // Ensure we always have a valid ID - use slug as ultimate fallback
    const validId = sanka.slug || sanka.id || `anime-${sanka.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

    return {
        id: validId,
        slug: sanka.slug,
        title: sanka.title,
        image: sanka.poster,
        poster: sanka.poster,
        episode: sanka.totalEpisodes,
        type: sanka.type,
        genres: sanka.genres,
        status: sanka.status,
        description: sanka.synopsis,
        synopsis: sanka.synopsis,
        rating: sanka.rating?.toString(),
        released: sanka.releaseDate,
        studio: sanka.studio
    };
}
