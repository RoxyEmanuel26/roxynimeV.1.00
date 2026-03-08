"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, ProviderSelector, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd, InFeedAd, NativeAd } from "@/components/ads";
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw } from "lucide-react";

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
  hasPrev: boolean;
  current_page: number;
  totalPages: number;
}

function OngoingLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}

export default function OngoingPage() {
  return (
    <Suspense fallback={<OngoingLoading />}>
      <OngoingContent />
    </Suspense>
  );
}

function OngoingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState("otakudesu");
  const [filters, setFilters] = useState<FilterState>({
    type: "ongoing",
    genre: "",
    order: "updated",
  });

  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);

  const buildUrl = (page: number, query: string, f: FilterState, src: string): string => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (f.genre) params.set("genre", f.genre);
    if (src && src !== "otakudesu") params.set("source", src);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/ongoing${qs ? `?${qs}` : ""}`;
  };

  const fetchAnime = useCallback(async (
    pageNum: number,
    query: string,
    f: FilterState,
    src: string
  ) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const fetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);
    setAnimes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      let url: string;
      if (query) {
        url = `/api/anime/search?q=${encodeURIComponent(query)}&page=${pageNum}&source=all`;
      } else if (f.genre) {
        url = `/api/anime?genre=${encodeURIComponent(f.genre)}&page=${pageNum}&source=${src}`;
      } else {
        url = `/api/anime?type=ongoing&page=${pageNum}&source=${src}`;
      }

      const response = await fetch(url, { signal: controller.signal });
      if (fetchId !== fetchIdRef.current) return;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: ApiResponse = await response.json();
      if (fetchId !== fetchIdRef.current) return;

      let list = (data.data || []).map((anime: any) => ({
        ...anime,
        id: anime.id || anime.slug || "",
        type: ["Ongoing"],
        genres: anime.genres || [],
      }));

      // When searching, filter to ongoing only
      if (query) {
        list = list.filter((anime: any) => {
          const s = anime.status?.toLowerCase() || "";
          return s.includes("ongoing") || s.includes("airing");
        });
      }

      const hasNext = (data.hasNext ?? false) && list.length > 0;
      const tp = Math.max(data.totalPages || 1, pageNum);

      setAnimes(list);
      setHasMore(hasNext);
      setTotalPages(hasNext && tp <= pageNum ? pageNum + 1 : tp);
      setCurrentPage(pageNum);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("[Ongoing] Fetch error:", err);
      setError("Gagal memuat data anime. Silakan coba lagi.");
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, []);

  // Mount only: read URL params and fetch
  useEffect(() => {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const query = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const src =
      (typeof window !== "undefined" && localStorage.getItem("roxynime_provider")) ||
      searchParams.get("source") ||
      "otakudesu";
    const f: FilterState = { type: "ongoing", genre, order: "updated" };

    setSearchQuery(query);
    setFilters(f);
    setSource(src);
    setCurrentPage(page);
    fetchAnime(page, query, f, src);

    return () => { if (abortRef.current) abortRef.current.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPage = useCallback((page: number) => {
    if (loading) return;
    const p = Math.max(1, page);
    router.replace(buildUrl(p, searchQuery, filters, source), { scroll: false });
    fetchAnime(p, searchQuery, filters, source);
  }, [loading, router, searchQuery, filters, source, fetchAnime]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    router.replace(buildUrl(1, query, filters, source), { scroll: false });
    fetchAnime(1, query, filters, source);
  }, [filters, source, router, fetchAnime]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    const f = { ...newFilters, type: "ongoing" };
    setFilters(f);
    router.replace(buildUrl(1, searchQuery, f, source), { scroll: false });
    fetchAnime(1, searchQuery, f, source);
  }, [searchQuery, source, router, fetchAnime]);

  const handleProviderChange = useCallback((providerId: string) => {
    setSource(providerId);
    router.replace(buildUrl(1, searchQuery, filters, providerId), { scroll: false });
    fetchAnime(1, searchQuery, filters, providerId);
  }, [searchQuery, filters, router, fetchAnime]);

  const effectiveTotalPages =
    hasMore && totalPages <= currentPage ? currentPage + 1 : Math.max(totalPages, 1);

  const paginationNumbers = (): (number | "...")[] => {
    if (effectiveTotalPages <= 7) {
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(effectiveTotalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < effectiveTotalPages - 1) pages.push("...");
    pages.push(effectiveTotalPages);
    return pages;
  };

  const pages = paginationNumbers();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Ongoing Anime</h1>
            <p className="text-muted-foreground">
              Anime yang sedang tayang saat ini
            </p>
          </div>
          <ProviderSelector onProviderChange={handleProviderChange} />
        </div>
      </div>

      <BannerAd slot="ongoing-top" />
      <NativeAd slot="ongoing-native1" />

      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        className="mb-6"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {!loading && !error && (
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? `Hasil untuk "${searchQuery}"` : "Anime ongoing"}
              {animes.length > 0 &&
                ` • Halaman ${currentPage}${effectiveTotalPages > 1 ? ` dari ${effectiveTotalPages}` : ""} • ${animes.length} judul`}
            </p>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-destructive font-medium">{error}</p>
              <button
                onClick={() => fetchAnime(currentPage, searchQuery, filters, source)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}

          {!error && <AnimeGrid animes={animes} loading={loading} />}

          <InFeedAd slot="ongoing-mid" />
          <NativeAd slot="ongoing-native2" />

          {!loading && !error && animes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <p className="text-xl">😕</p>
              <p className="text-muted-foreground">Tidak ada anime ongoing ditemukan.</p>
              <p className="text-sm text-muted-foreground">Coba ganti provider atau ubah filter.</p>
            </div>
          )}

          {!loading && !error && animes.length > 0 && (
            <nav className="flex items-center justify-center gap-1 mt-8 flex-wrap" aria-label="Pagination">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="btn-outline p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Prev</span>
              </button>

              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="px-2 py-2 text-muted-foreground select-none">…</span>
                ) : (
                  <button
                    key={`p-${p}`}
                    onClick={() => goToPage(p as number)}
                    disabled={currentPage === p}
                    className={`min-w-[38px] px-3 py-2 rounded-md transition-colors text-sm font-medium
                      ${currentPage === p
                        ? "bg-primary text-primary-foreground cursor-default shadow-sm"
                        : "hover:bg-muted"}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore}
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span className="hidden sm:inline text-sm">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToPage(effectiveTotalPages)}
                disabled={currentPage === effectiveTotalPages || !hasMore}
                className="btn-outline p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </nav>
          )}

          <div className="mt-8 space-y-4">
            <InFeedAd slot="ongoing-bottom" />
            <BannerAd slot="ongoing-footer" />
          </div>
        </div>

        <aside className="lg:w-[300px] space-y-6 shrink-0">
          <SidebarAd className="hidden lg:flex" />
        </aside>
      </div>

      <div className="lg:hidden mt-8 space-y-3">
        <InFeedAd slot="ongoing-mobile-bottom" />
        <BannerAd slot="ongoing-mobile-footer" />
      </div>
    </div>
  );
}
