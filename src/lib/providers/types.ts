// Standard types that all providers must normalize to

export interface ProviderAnime {
    id: string;
    slug: string;
    title: string;
    poster: string;
    synopsis?: string;
    genres?: string[];
    type?: string;       // TV, Movie, OVA, Donghua, etc.
    status?: string;     // Ongoing, Completed, Unknown
    totalEpisodes?: number;
    rating?: number;
    releaseDate?: string;
    studio?: string;
}

export interface ProviderEpisode {
    id: string;
    number: number;
    title?: string;
    urlSlug: string;
    date?: string;
}

export interface ProviderStreamServer {
    name: string;
    quality?: string;
    streamUrl: string;
}

export interface ProviderAnimeDetail extends ProviderAnime {
    episodes: ProviderEpisode[];
    japaneseTitle?: string;
    englishTitle?: string;
    season?: string;
    duration?: string;
    source?: string;      // Manga, Light Novel, etc.
}

export interface PaginationInfo {
    currentPage: number;
    lastVisiblePage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages?: number;
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

export interface ProviderInfo {
    id: string;
    name: string;
    description: string;
    icon: string;         // emoji icon
    language: string;     // "id", "zh", "jp"
    contentType: string;  // "Anime", "Donghua", "Mixed"
    features: {
        home: boolean;
        ongoing: boolean;
        completed: boolean;
        search: boolean;
        detail: boolean;
        streaming: boolean;
        schedule: boolean;
        genres: boolean;
        movies: boolean;
    };
}

// The interface every provider adapter must implement
export interface AnimeProvider {
    readonly info: ProviderInfo;

    // Home / Trending
    getHome(): Promise<ProviderAnime[]>;

    // Ongoing Anime (paginated)
    getOngoing(page?: number): Promise<PaginatedResponse<ProviderAnime[]>>;

    // Completed Anime (paginated) — optional, not all providers have this
    getCompleted(page?: number): Promise<PaginatedResponse<ProviderAnime[]>>;

    // Anime Detail + Episode List
    getDetail(slug: string): Promise<ProviderAnimeDetail>;

    // Search
    search(query: string): Promise<PaginatedResponse<ProviderAnime[]>>;

    // Streaming links for an episode
    getStreams(episodeSlug: string): Promise<ProviderStreamServer[]>;

    // Movies list — optional
    getMovies?(page?: number): Promise<PaginatedResponse<ProviderAnime[]>>;

    // Genre list — optional
    getByGenre?(genre: string, page?: number): Promise<PaginatedResponse<ProviderAnime[]>>;

    // Schedule — optional
    getSchedule?(): Promise<Record<string, ProviderAnime[]>>;
}
