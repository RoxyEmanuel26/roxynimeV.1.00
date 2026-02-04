// Anime types
export interface Anime {
    id: string;
    slug: string;
    title: string;
    image: string;
    episode?: string;
    type?: string[];
    synopsis?: string;
    rating?: number;
    rank?: number;
    popularity?: number;
    totalEpisodes?: number;
    status?: string;
    genres?: string[];
    season?: string;
    studio?: string;
    released?: string;
}

export interface AnimeDetail extends Anime {
    episodes: Episode[];
    related?: Anime[];
    trailer?: string;
}

export interface Episode {
    id: string;
    number: number;
    title?: string;
    slug: string;
    thumbnail?: string;
}

export interface StreamingData {
    title: string;
    episode: string;
    streams: Stream[];
    downloads?: Download[];
}

export interface Stream {
    quality: string;
    url: string;
    type: string;
}

export interface Download {
    quality: string;
    url: string;
}

// Filter types
export interface AnimeFilters {
    search?: string;
    genre?: string;
    type?: "ongoing" | "completed" | "movie";
    season?: string;
    year?: number;
    order?: "updated" | "popular" | "rating";
}

// Pagination types
export interface PaginationInfo {
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}
