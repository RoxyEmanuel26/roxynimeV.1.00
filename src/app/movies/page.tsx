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
}

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "movie",
    status: "all",
    genre: "all",
    sortBy: "latest",
  });

  const fetchAnimes = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("type", "movie");
      
      if (filters.search) params.append("search", filters.search);
      if (filters.status !== "all") params.append("status", filters.status);
      if (filters.genre !== "all") params.append("genre", filters.genre);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);

      const response = await fetch(`/api/anime?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      // Override type to "Movie" for all anime
      setAnimes(data.data.map((anime: Anime) => ({ ...anime, type: ["Movie"] })));
      setHasMore(data.hasNext ?? false);
    } catch (error) {
      console.error("Error fetching animes:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Update URL when page/filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage.toString());
    
    const newUrl = `/movies${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [currentPage, router]);

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({ ...newFilters, type: "movie" });
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
    const maxVisible = 7; // Maximum number of page buttons to show

    if (currentPage <= 4) {
      // Near the start: 1 2 3 4 5 ... (if hasMore)
      for (let i = 1; i <= Math.min(5, currentPage + 2); i++) {
        pages.push(i);
      }
      if (hasMore) {
        pages.push("...");
      }
    } else {
      // In the middle or end: 1 ... current-1 current current+1 ...
      pages.push(1);
      
      if (currentPage > 5) {
        pages.push("...");
      }
      
      // Show current page and neighbors
      pages.push(currentPage - 1);
      pages.push(currentPage);
      
      if (hasMore) {
        pages.push(currentPage + 1);
        pages.push("...");
      }
    }

    return pages;
  };

  const paginationNumbers = generatePaginationNumbers();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anime Movies</h1>
        <p className="text-muted-foreground">
          Discover and watch your favorite anime movies and films
        </p>
      </div>

      <BannerAd />

      <div className="flex gap-6 mt-8">
        <div className="flex-1">
          <SearchFilter
            filters={{ ...filters, type: "movie" }}
            onFilterChange={handleFilterChange}
            hideTypeFilter={true}
          />

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Showing anime movies • {animes.length} titles
            </p>

            <AnimeGrid animes={animes} />
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {paginationNumbers.map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && goToPage(page)}
                disabled={page === "..."}
                className={`px-4 py-2 rounded-lg border ${
                  page === currentPage
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                } disabled:cursor-default`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={!hasMore}
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <aside className="w-80 hidden lg:block">
          <div className="sticky top-20">
            <SidebarAd />
          </div>
        </aside>
      </div>
    </div>
  );
}
