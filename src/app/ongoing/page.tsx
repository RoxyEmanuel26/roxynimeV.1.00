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

export default function OngoingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "ongoing",
    status: "all",
    genre: "all",
    sortBy: "latest",
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
        params.append("type", "ongoing");
        
        if (filters.search) params.append("search", filters.search);
        if (filters.status !== "all") params.append("status", filters.status);
        if (filters.genre !== "all") params.append("genre", filters.genre);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);

        const response = await fetch(`/api/anime?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (shouldAppend) {
          setAnimes((prev) => [...prev, ...data.data]);
        } else {
          setAnimes(data.data);
        }

        setHasMore(data.has_next?.has_next_page ?? false);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching animes:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchAnimes(1);
  }, [fetchAnimes]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({ ...newFilters, type: "ongoing" });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ongoing Anime</h1>
        <p className="text-muted-foreground">
          Watch the latest ongoing anime series currently airing
        </p>
      </div>

      <BannerAd />

      <div className="flex gap-6 mt-8">
        <div className="flex-1">
          <SearchFilter
            filters={{ ...filters, type: "ongoing" }}
            onFilterChange={handleFilterChange}
            hideTypeFilter={true}
          />

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Showing ongoing anime • {animes.length} titles
            </p>
            <AnimeGrid animes={animes} />
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
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
