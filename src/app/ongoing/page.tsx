"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, ProviderSelector, type FilterState } from "@/components/anime";
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
  // Read provider from localStorage
  const [source, setSource] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("roxynime_provider") || "otakudesu";
    }
    return "otakudesu";
  });
  const [filters, setFilters] = useState<FilterState>({
    type: "ongoing",
    genre: "",
    order: "updated",
  });

  // Abort controller to cancel stale fetches
  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);

  const fetchAnimes = useCallback(
    async (page: number = 1, shouldAppend = false) => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const currentFetchId = ++fetchIdRef.current;

      if (shouldAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setAnimes([]); // Clear stale data immediately
      }

      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("type", "ongoing");
        params.append("source", source);

        if (searchQuery) params.append("search", searchQuery);
        if (filters.genre) params.append("genre", filters.genre);
        if (filters.order) params.append("order", filters.order);

        const response = await fetch(`/api/anime?${params.toString()}`, { signal: controller.signal });

        // If this fetch is stale, discard
        if (currentFetchId !== fetchIdRef.current) return;

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
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Error fetching animes:", error);
      } finally {
        if (currentFetchId === fetchIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [filters, searchQuery, source]
  );

  useEffect(() => {
    fetchAnimes(1);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchAnimes]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({ ...newFilters, type: "ongoing" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProviderChange = (providerId: string) => {
    if (abortRef.current) abortRef.current.abort();
    setAnimes([]); // Clear stale data immediately
    setSource(providerId);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchAnimes(currentPage + 1, true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Ongoing Anime</h1>
            <p className="text-muted-foreground">
              Watch the latest ongoing anime series currently airing
            </p>
          </div>
          <ProviderSelector onProviderChange={handleProviderChange} />
        </div>
      </div>

      {/* Ad Layer 1 — Top */}
      <BannerAd slot="ongoing-top" />
      <NativeAd slot="ongoing-native1" />

      {/* Search and Filters */}
      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        className="mb-6"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Results Info */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing ongoing anime • {animes.length} titles
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimeGrid animes={animes} />
          )}

          {/* Ad Layer 2 — After Grid */}
          <InFeedAd slot="ongoing-mid" />
          <NativeAd slot="ongoing-native2" />

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
