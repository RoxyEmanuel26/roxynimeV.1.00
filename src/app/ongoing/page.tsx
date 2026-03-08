"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd, InFeedAd, NativeAd } from "@/components/ads";
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

// Loading fallback
function OngoingLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

// Main wrapper with Suspense
export default function OngoingPage() {
  return (
    <Suspense fallback={<OngoingLoading />}>
      <OngoingContent />
    </Suspense>
  );
}

// Actual content
function OngoingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "ongoing",
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
        params.append("type", "ongoing");

        if (searchQuery) params.append("search", searchQuery);
        if (filters.genre) params.append("genre", filters.genre);
        if (filters.order) params.append("order", filters.order);

        const response = await fetch(`/api/anime?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (shouldAppend) {
          setAnimes((prev) => [...prev, ...data.data.map((anime) => ({ ...anime, type: ["Ongoing"] }))]);
        } else {
          setAnimes(data.data.map((anime) => ({ ...anime, type: ["Ongoing"] })));
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
    setFilters({ ...newFilters, type: "ongoing" });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ongoing Anime</h1>
        <p className="text-muted-foreground">
          Watch the latest ongoing anime series currently airing
        </p>
      </div>

      {/* Ad Layer 1 — Top */}
      <BannerAd slot="ongoing-top" />
      <NativeAd slot="ongoing-native1" />

      <div className="flex gap-6 mt-8">
        <div className="flex-1">
          <SearchFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Showing ongoing anime • {animes.length} titles
            </p>
            <AnimeGrid animes={animes} />

            {/* Ad Layer 2 — After Grid */}
            <InFeedAd slot="ongoing-mid" />
            <NativeAd slot="ongoing-native2" />
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
          <div className="sticky top-20 space-y-4">
            <SidebarAd />
          </div>
        </aside>
      </div>

      {/* Ad Layer 3 — Bottom */}
      <InFeedAd slot="ongoing-bottom" />
      <BannerAd slot="ongoing-footer" />
    </div>
  );
}
