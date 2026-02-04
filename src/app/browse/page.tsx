"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd } from "@/components/ads";
import { Loader2 } from "lucide-react";

interface Anime {
    id?: string;
    slug: string;
    title: string;
    image: string;
    episode?: string;
    type?: string[];
}

interface ApiResponse {
    status: string;
    data: Anime[];
    has_next: { has_next_page: boolean };
    current_page: number;
}

export default function BrowsePage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [animes, setAnimes] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [filters, setFilters] = useState<FilterState>({
        type: searchParams.get("type") || "",
        genre: searchParams.get("genre") || "",
        order: "updated",
    });

    const fetchAnime = useCallback(async (pageNum: number, isLoadMore = false) => {
        try {
            if (!isLoadMore) setLoading(true);
            else setLoadingMore(true);

            const type = filters.type || "ongoing";
            let url = `/api/anime?type=${type}&page=${pageNum}`;

            if (searchQuery) {
                url = `/api/anime/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
            }

            const response = await fetch(url);
            const data: ApiResponse = await response.json();

            // Data already has correct id from the API, no need to process
            const processedAnimes = data.data.map((anime) => ({
                ...anime,
                // Use existing id or slug as fallback
                id: anime.id || anime.slug || "",
            }));

            if (isLoadMore) {
                setAnimes((prev) => [...prev, ...processedAnimes]);
            } else {
                setAnimes(processedAnimes);
            }

            setHasMore(data.has_next?.has_next_page ?? false);
        } catch (error) {
            console.error("Error fetching anime:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters.type, searchQuery]);

    // Initial fetch and filter changes
    useEffect(() => {
        setPage(1);
        fetchAnime(1);
    }, [fetchAnime]);

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (filters.type) params.set("type", filters.type);
        if (filters.genre) params.set("genre", filters.genre);

        const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ""}`;
        router.replace(newUrl, { scroll: false });
    }, [searchQuery, filters, router]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchAnime(nextPage, true);
        }
    };

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 1000
            ) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, hasMore, loadingMore]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Browse Anime</h1>
                <p className="text-muted-foreground">
                    Discover and watch your favorite anime series and movies
                </p>
            </div>

            {/* Top Banner Ad */}
            <BannerAd className="mb-8" />

            {/* Search and Filters */}
            <SearchFilter
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                className="mb-8"
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Results Info */}
                    {!loading && (
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery
                                ? `Showing results for "${searchQuery}"`
                                : `Showing ${filters.type || "ongoing"} anime`}
                            {animes.length > 0 && ` • ${animes.length} titles`}
                        </p>
                    )}

                    {/* Anime Grid */}
                    <AnimeGrid animes={animes} loading={loading} />

                    {/* Load More */}
                    {loadingMore && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!loading && !loadingMore && hasMore && animes.length > 0 && (
                        <div className="flex justify-center py-8">
                            <button onClick={loadMore} className="btn-outline">
                                Load More
                            </button>
                        </div>
                    )}

                    {!loading && !hasMore && animes.length > 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            You&apos;ve reached the end
                        </p>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="lg:w-[300px] space-y-6">
                    <SidebarAd className="hidden lg:flex" />
                </aside>
            </div>

            {/* Mobile Bottom Ad */}
            <div className="lg:hidden mt-8">
                <SidebarAd className="w-full h-[100px]" />
            </div>
        </div>
    );
}
