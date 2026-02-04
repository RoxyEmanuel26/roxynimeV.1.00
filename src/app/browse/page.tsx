"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd } from "@/components/ads";
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

export default function BrowsePage() {
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
  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get("type") || "completed", // Default to completed for more pages
    genre: searchParams.get("genre") || "",
    order: "updated",
  });

  const fetchAnime = useCallback(
    async (pageNum: number) => {
      try {
        setLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const type = filters.type || "completed"; // Default to completed
        let url = `/api/anime?type=${type}&page=${pageNum}`;

        if (searchQuery) {
          url = `/api/anime/search?q=${encodeURIComponent(
            searchQuery
          )}&page=${pageNum}`;
        }

        const response = await fetch(url);
        const data: ApiResponse = await response.json();

        // Process anime to match UI requirements
        const processedAnimes = data.data.map((anime: any) => ({
          ...anime,
          id: anime.id || anime.slug || "",
          // If viewing completed or anime is completed, override type to show "Completed" badge
          type: (type === 'completed' || anime.status === 'Completed') ? ['Completed'] : anime.type
        }));

        setAnimes(processedAnimes);
        setHasMore(data.hasNext ?? false);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters.type, searchQuery]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1");
    setCurrentPage(pageFromUrl);
    fetchAnime(pageFromUrl);
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
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

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

    // If we don't have totalPages or it's 1, just return [1]
    if (totalPages <= 1) return [1];

    const maxVisible = 5; // number of buttons to show in the main block

    if (totalPages <= maxVisible + 2) {
      // If total pages is small, show all
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Calculate start and end of visible range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at the very beginning
    if (currentPage < 3) {
      end = 4;
    }

    // Adjust if at the very end
    if (currentPage > totalPages - 2) {
      start = totalPages - 3;
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

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
                : `Showing ${filters.type || "completed"} anime`}
              {animes.length > 0 && ` • Page ${currentPage} • ${animes.length} titles`}
            </p>
          )}

          {/* Anime Grid */}
          <AnimeGrid animes={animes} loading={loading} />

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

      {/* Mobile Bottom Ad */}
      <div className="lg:hidden mt-8">
        <SidebarAd className="w-full h-[100px]" />
      </div>
    </div>
  );
}
