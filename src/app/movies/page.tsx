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
  current_page: number;
  totalPages?: number;
}

// Loading fallback component
function MoviesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function MoviesPage() {
  return (
    <Suspense fallback={<MoviesLoading />}>
      <MoviesContent />
    </Suspense>
  );
}

// Actual content component
function MoviesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // Read provider from localStorage
  const [source, setSource] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("roxynime_provider") || searchParams.get("source") || "otakudesu";
    }
    return searchParams.get("source") || "otakudesu";
  });

  const [filters, setFilters] = useState<FilterState>({
    type: "movie",
    genre: searchParams.get("genre") || "",
    order: "updated",
  });

  // Abort controller to cancel stale fetches
  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);

  const fetchAnimes = useCallback(
    async (page: number) => {
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

        let url = `/api/anime?type=movie&page=${page}&source=${source}`;

        if (searchQuery) {
          url = `/api/anime/search?q=${encodeURIComponent(
            searchQuery
          )}&page=${page}&source=all`;
        } else if (filters.genre) {
          url = `/api/anime?genre=${encodeURIComponent(
            filters.genre
          )}&page=${page}&source=${source}`;
        }

        const response = await fetch(url, { signal: controller.signal });

        // If this fetch is no longer the latest, discard its result
        if (currentFetchId !== fetchIdRef.current) return;

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        // If searching, we need to filter to only include Movies
        let results = Array.isArray(data.data) ? data.data : [];
        if (searchQuery) {
          results = results.filter((anime: any) => {
            const t = (anime.type || "").toLowerCase();
            return t.includes("movie") || t.includes("film");
          });
        }

        // Process and add type badge
        const processedAnimes = results.map((anime: any) => ({
          ...anime,
          type: ["Movie"],
          genres: anime.genres || []
        }));

        setAnimes(processedAnimes);
        setHasMore((data.hasNext ?? false) && processedAnimes.length > 0);
        setTotalPages(data.totalPages || 1);
      } catch (error: any) {
        // Ignore abort errors (expected when switching providers)
        if (error?.name === "AbortError") return;
        console.error("Error fetching animes:", error);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [filters.genre, filters.order, searchQuery, source]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1");
    setCurrentPage(pageFromUrl);
    fetchAnimes(pageFromUrl);

    // Cleanup: abort on unmount or dependency change
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchAnimes, searchParams]);

  // Update URL params when page/filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (filters.genre) params.set("genre", filters.genre);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = `/movies${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [currentPage, searchQuery, filters, router]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({ ...newFilters, type: "movie" });
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleProviderChange = useCallback((providerId: string) => {
    // Abort any in-flight request from the old provider
    if (abortRef.current) abortRef.current.abort();
    setAnimes([]); // Clear stale data immediately
    setSource(providerId);
    setCurrentPage(1);
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (hasMore) goToPage(currentPage + 1);
  };

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const pages: (number | string)[] = [];

    // Special handling for genre filter - API doesn't give total pages accurately
    if (filters.genre) {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const maxPageToShow = hasMore ? currentPage + 2 : currentPage;
      for (let i = Math.max(2, currentPage - 1); i <= maxPageToShow; i++) {
        if (i > 1) pages.push(i);
      }
      if (hasMore) pages.push("...");
      return pages;
    }

    // Normal pagination
    let effectiveTotalPages = totalPages;
    if (effectiveTotalPages <= 1) return [1];

    const maxVisible = 5;
    if (effectiveTotalPages <= maxVisible + 2) {
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(effectiveTotalPages - 1, currentPage + 1);

    if (currentPage < 3) end = 4;
    if (currentPage > effectiveTotalPages - 2) start = effectiveTotalPages - 3;

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < effectiveTotalPages) pages.push(i);
    }

    if (currentPage < effectiveTotalPages - 2) pages.push("...");
    pages.push(effectiveTotalPages);

    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Anime Movies</h1>
            <p className="text-muted-foreground">
              Discover and watch your favorite anime movies and films
            </p>
          </div>
          <ProviderSelector onProviderChange={handleProviderChange} />
        </div>
      </div>

      {/* Ad Layer 1 — Top */}
      <BannerAd slot="movies-top" className="mb-4" />
      <NativeAd slot="movies-native1" />

      {/* Search and Filters */}
      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Results Info */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : `Showing anime movies`}
              {animes.length > 0 && ` • Page ${currentPage} • ${animes.length} titles`}
            </p>
          )}

          {/* Anime Grid */}
          <AnimeGrid animes={animes} loading={loading} />

          {/* Ad Layer 2 — After Grid */}
          <InFeedAd slot="movies-mid" />
          <NativeAd slot="movies-native2" />

          {/* Pagination */}
          {!loading && animes.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

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

          {/* No Results */}
          {!loading && animes.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No anime movies found. Try adjusting your filters or switching providers.
            </p>
          )}
        </div>

        <aside className="w-80 hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <SidebarAd />
          </div>
        </aside>
      </div>

      {/* Ad Layer 3 — Bottom */}
      <InFeedAd slot="movies-bottom" />
      <BannerAd slot="movies-footer" />
    </div>
  );
}
