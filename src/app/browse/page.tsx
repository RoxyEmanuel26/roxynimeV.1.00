"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, ProviderSelector, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd, InFeedAd, NativeAd } from "@/components/ads";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
  hasNext: boolean;
  currentPage: number;
  totalPages: number;
}

// Loading fallback
function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

// Main wrapper with Suspense
export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseContent />
    </Suspense>
  );
}

// Actual content
function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  // Read provider from localStorage first, then URL param, then default
  const [source, setSource] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("roxynime_provider") || searchParams.get("source") || "otakudesu";
    }
    return searchParams.get("source") || "otakudesu";
  });
  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get("type") || "completed",
    genre: searchParams.get("genre") || "",
    order: "updated",
  });

  // Abort controller ref to cancel in-flight fetches on provider switch
  const abortRef = useRef<AbortController | null>(null);
  // Track current fetch ID to ignore stale responses
  const fetchIdRef = useRef(0);

  const fetchAnime = useCallback(
    async (pageNum: number) => {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const currentFetchId = ++fetchIdRef.current;

      try {
        setLoading(true);
        setAnimes([]); // Clear immediately to avoid stale data
        window.scrollTo({ top: 0, behavior: "smooth" });

        const type = filters.type || "completed";
        let url = `/api/anime?type=${type}&page=${pageNum}&source=${source}`;

        // If search query is present, search ALL providers
        if (searchQuery) {
          url = `/api/anime/search?q=${encodeURIComponent(
            searchQuery
          )}&page=${pageNum}&source=all`;
        }
        // If genre filter is selected, use genre endpoint
        else if (filters.genre) {
          url = `/api/anime?genre=${encodeURIComponent(
            filters.genre
          )}&page=${pageNum}&source=${source}`;
        }

        console.log("[Browse] Fetching:", url);

        const response = await fetch(url, { signal: controller.signal });

        // If this fetch is no longer the latest, discard its result
        if (currentFetchId !== fetchIdRef.current) return;

        const data: ApiResponse = await response.json();

        // Process anime to match UI requirements
        let processedAnimes = data.data.map((anime: any) => ({
          ...anime,
          id: anime.id || anime.slug || "",
          type: (type === 'completed' || anime.status === 'Completed') ? ['Completed'] : anime.type,
          genres: anime.genres || []
        }));

        // Client-side Sorting
        if (filters.order === "rating") {
          processedAnimes.sort((a: any, b: any) => {
            const ratingA = parseFloat(a.rating || a.score || "0") || 0;
            const ratingB = parseFloat(b.rating || b.score || "0") || 0;
            return ratingB - ratingA;
          });
        }

        setAnimes(processedAnimes);
        setHasMore((data.hasNext ?? false) && processedAnimes.length > 0);
        setTotalPages(data.totalPages || 1);
      } catch (error: any) {
        // Ignore abort errors (expected when switching providers)
        if (error?.name === "AbortError") return;
        console.error("Error fetching anime:", error);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [filters.type, filters.genre, filters.order, searchQuery, source]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1");
    setCurrentPage(pageFromUrl);
    fetchAnime(pageFromUrl);

    // Cleanup: abort on unmount or dependency change
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchAnime, searchParams]);

  // Update URL params when page/filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (filters.type && filters.type !== "completed") params.set("type", filters.type); // Don't put default in URL to clean it up? Or consistent?
    // User asked for browse to show completed. Let's keep it explicit or clean.
    // If I put "completed", it forces the filter.
    if (filters.type) params.set("type", filters.type);

    if (filters.genre) params.set("genre", filters.genre);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [currentPage, searchQuery, filters, router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);

    // Immediately clear page from URL so it doesn't persist
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (query) params.set("search", query);
    else params.delete("search");
    router.replace(`/browse${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);

    // Immediately clear page from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.genre) params.set("genre", newFilters.genre);
    else params.delete("genre");
    router.replace(`/browse${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  const handleProviderChange = useCallback((providerId: string) => {
    if (abortRef.current) abortRef.current.abort();
    setAnimes([]);
    setSource(providerId);
    setCurrentPage(1);

    // Immediately clear page from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    router.replace(`/browse${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [router, searchParams]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pages: (number | string)[] = [];

    let effectiveTotalPages = totalPages;

    // Provide a fallback if API misbehaves but we know there's more
    if (effectiveTotalPages <= 1 && hasMore) {
      effectiveTotalPages = currentPage + 1;
    } else if (effectiveTotalPages <= 1) {
      return [1];
    }

    const maxVisible = 5;

    // If total pages is small, show all pages
    if (effectiveTotalPages <= maxVisible + 2) {
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    // Calculate start and end of visible pages
    if (currentPage > 3) {
      pages.push("...");
    }

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(effectiveTotalPages - 1, currentPage + 1);

    // Adjust if at the edges
    if (currentPage < 3) {
      end = 4;
    }
    if (currentPage > effectiveTotalPages - 2) {
      start = effectiveTotalPages - 3;
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < effectiveTotalPages) {
        pages.push(i);
      }
    }

    // Always show last page
    if (currentPage < effectiveTotalPages - 2) {
      pages.push("...");
    }
    pages.push(effectiveTotalPages);

    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Browse Anime</h1>
            <p className="text-muted-foreground">
              Discover and watch your favorite anime series and movies
            </p>
          </div>
          <ProviderSelector onProviderChange={handleProviderChange} />
        </div>
      </div>

      {/* Ad Layer 1 — Top banner */}
      <BannerAd slot="browse-top" className="mb-4" />
      <NativeAd slot="browse-after-top" />

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
                : `Showing ${filters.type || "completed"} anime`}
              {animes.length > 0 && ` • Page ${currentPage} • ${animes.length} titles`}
            </p>
          )}

          {/* Anime Grid */}
          <AnimeGrid animes={animes} loading={loading} />

          {/* Ad Layer 2 — After grid */}
          <InFeedAd slot="browse-after-grid" />
          <NativeAd slot="browse-inside" />

          {/* Pagination */}
          {!loading && animes.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {paginationNumbers.map((pageNum, index) =>
                  pageNum === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum as number)}
                      className={`px-3 py-2 rounded-md transition-colors ${currentPage === pageNum
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted"
                        }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={!hasMore}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Ad Layer 3 — After Pagination */}
          <div className="mt-8 space-y-4">
            <BannerAd slot="browse-post-page-1" />
            <InFeedAd slot="browse-post-page-2" />
            <BannerAd slot="browse-post-page-3" />
          </div>

          {/* No Results */}
          {!loading && animes.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No anime found. Try adjusting your filters.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-[300px] space-y-6">
          <SidebarAd className="hidden lg:flex" />
        </aside>
      </div>

      {/* Ad Layer 4 — Mobile Bottom */}
      <div className="lg:hidden mt-8 space-y-3">
        <InFeedAd slot="browse-mobile-bottom" />
        <BannerAd slot="browse-mobile-footer" />
      </div>

    </div>
  );
}
