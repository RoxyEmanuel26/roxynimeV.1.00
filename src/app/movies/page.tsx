"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
  hasNext: boolean;
  current_page: number;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "movie",
    genre: "",
    order: "updated",
  });

  const fetchAnimes = useCallback(
    async (page: number = 1, shouldAppend = false) => {
      if (shouldAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("type", "movie");

        // If search query is active, add search param
        if (searchQuery) {
          params.append("search", searchQuery);
        }
        // If genre filter is selected, use genre endpoint
        else if (filters.genre) {
          params.delete("type"); // Remove type when filtering by genre
          params.append("genre", filters.genre);
        }

        const response = await fetch(`/api/anime?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        // Process and add type badge
        let processedAnimes = data.data.map((anime: Anime) => ({
          ...anime,
          type: ["Movie"],
          genres: (anime as any).genres || []
        }));

        // Note: Genre filter is now handled by using genre as search query above
        // No additional client-side filtering needed since API doesn't return genre data

        // Client-side Sorting
        if (filters.order) {
          switch (filters.order) {
            case "rating":
              processedAnimes.sort((a: any, b: any) => {
                const ratingA = parseFloat(a.rating || a.score || "0") || 0;
                const ratingB = parseFloat(b.rating || b.score || "0") || 0;
                return ratingB - ratingA;
              });
              break;
            case "popular":
            case "updated":
            default:
              break;
          }
        }

        if (shouldAppend) {
          setAnimes((prev) => [...prev, ...processedAnimes]);
        } else {
          setAnimes(processedAnimes);
        }

        setHasMore(data.hasNext ?? false);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching animes:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, searchQuery]
  );

  useEffect(() => {
    fetchAnimes(1);
  }, [fetchAnimes]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({ ...newFilters, type: "movie" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAnimes(currentPage + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate pagination numbers
  const generatePaginationNumbers = () => {
    const totalPages = 1; // Search pagination is limited/broken, simplify to 1 or dynamic if fixed
    // Since search pagination is unreliable, we might just stick to simple "Next/Prev" or just 1 page?
    // User requested "browse-like". Browse has numbers.
    // If we assume 1 page of results for now (due to API limit):

    // Note: animbus.getMoviesList DOES NOT currently return pagination info correctly passed from search
    // We'll stick to basic implementation but styled like browse
    return [1];
  };

  const paginationNumbers = generatePaginationNumbers();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Anime Movies</h1>
        <p className="text-muted-foreground">
          Discover and watch your favorite anime movies and films
        </p>
      </div>

      <BannerAd className="mb-8" />

      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : `Showing anime movies`}
              {animes.length > 0 && ` • ${animes.length} titles`}
            </p>
          )}

          <AnimeGrid animes={animes} />

          {/* Pagination (Simplified since API pagination is broken for search) */}
          {/* We keep the structural layout of Browse but maybe hide pagination if only 1 page */}
        </div>

        <aside className="w-80 hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <SidebarAd />
          </div>
        </aside>
      </div>
    </div>
  );
}
