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

function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <div className="skeleton h-8 w-48 mb-2 rounded" />
            <div className="skeleton h-4 w-64 rounded" />
          </div>
        </div>
      </div>
      <div className="skeleton h-[90px] w-full max-w-[728px] mx-auto mb-4 rounded" />
      <div className="skeleton h-[90px] w-full max-w-[728px] mx-auto mb-8 rounded" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <AnimeGrid animes={[]} loading={true} />
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [source, setSource] = useState("otakudesu");
  const [filters, setFilters] = useState<FilterState>({
    type: "completed",
    genre: "",
    order: "updated",
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);
  const currentPageRef = useRef(1);

  // ── Build browse URL from current params ───────────────────────────────────
  const buildBrowseUrl = (
    page: number,
    query: string,
    f: FilterState,
    src: string
  ): string => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (f.type) params.set("type", f.type);
    if (f.genre) params.set("genre", f.genre);
    // FIXED: Always write the source to URL to prevent stale loops
    if (src) params.set("source", src);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/browse${qs ? `?${qs}` : ""}`;
  };

  // ── Core fetch — all params explicit, NO closure over state ───────────────
  const fetchAnime = useCallback(async (
    pageNum: number,
    query: string,
    f: FilterState,
    src: string
  ) => {
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const fetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);
    // FIXED: Pertahankan data lama saat loading agar grid tidak kosong

    try {
      let url: string;

      if (query) {
        url = `/api/anime/search?q=${encodeURIComponent(query)}&page=${pageNum}&source=all`;
      } else if (f.genre) {
        url = `/api/anime?genre=${encodeURIComponent(f.genre)}&page=${pageNum}&source=${src}`;
      } else {
        url = `/api/anime?type=${f.type || "completed"}&page=${pageNum}&source=${src}`;
      }

      const response = await fetch(url, { signal: controller.signal });

      // Discard stale response if a newer fetch was started
      if (fetchId !== fetchIdRef.current) return;

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: ApiResponse = await response.json();
      if (fetchId !== fetchIdRef.current) return;

      // FIXED: Simpan hasNext SEBELUM filter
      const rawHasNext = data.hasNext ?? false;

      // Normalise anime list
      let list = (data.data || []).map((anime: any) => ({
        ...anime,
        id: anime.id || anime.slug || "",
        type:
          f.type === "completed" || anime.status === "Completed"
            ? ["Completed"]
            : anime.type,
        genres: anime.genres || [],
      }));

      // FIXED: Frontend safety dedup — menangkap duplikat yang lolos dari API
      const seenKeys = new Set<string>();
      list = list.filter((anime: any) => {
        const key = anime.slug || anime.id || anime.title?.toLowerCase().trim();
        if (!key || seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });

      // Client-side sort by rating if requested
      if (f.order === "rating") {
        list.sort((a: any, b: any) => {
          const ra = parseFloat(a.rating || a.score || "0") || 0;
          const rb = parseFloat(b.rating || b.score || "0") || 0;
          return rb - ra;
        });
      }

      const tp = Math.max(data.totalPages || 1, pageNum);

      setAnimes(list);
      // FIXED: pakai rawHasNext dari API, bukan dari filtered list
      setHasMore(rawHasNext);
      setHasPrev(data.hasPrev ?? pageNum > 1);
      setTotalPages(rawHasNext && tp <= pageNum ? pageNum + 1 : tp);
      setCurrentPage(pageNum);

      // FIXED: scroll hanya setelah data berhasil dimuat, bukan saat mulai fetch
      if (pageNum !== currentPageRef.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      currentPageRef.current = pageNum;
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("[Browse] Fetch error:", err);
      setError("Gagal memuat data anime. Silakan coba lagi.");
    } finally {
      if (fetchId === fetchIdRef.current) setLoading(false);
    }
  }, []);

  // ── Mount: initialise state from URL then fetch ────────────────────────────
  useEffect(() => {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const query = searchParams.get("search") || "";
    const type = searchParams.get("type") || "completed";
    const genre = searchParams.get("genre") || "";
    // FIXED: URL parameters have absolute priority over cached localStorage
    const srcFromUrl = searchParams.get("source");
    const srcFromStorage = typeof window !== "undefined"
      ? localStorage.getItem("roxynime_provider")
      : null;
    const src = srcFromUrl || srcFromStorage || "otakudesu";

    const f: FilterState = { type, genre, order: "updated" };

    setSearchQuery(query);
    setFilters(f);
    setSource(src);
    setCurrentPage(page);

    fetchAnime(page, query, f, src);

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // ── Navigation — update URL + fetch directly, NO useEffect chain ──────────
  const goToPage = useCallback(
    (page: number) => {
      if (loading) return;
      const clamped = Math.max(1, page);
      router.replace(buildBrowseUrl(clamped, searchQuery, filters, source), {
        scroll: false,
      });
      fetchAnime(clamped, searchQuery, filters, source);
    },
    [loading, router, searchQuery, filters, source, fetchAnime]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      router.replace(buildBrowseUrl(1, query, filters, source), { scroll: false });
      fetchAnime(1, query, filters, source);
    },
    [filters, source, router, fetchAnime]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      router.replace(buildBrowseUrl(1, searchQuery, newFilters, source), {
        scroll: false,
      });
      fetchAnime(1, searchQuery, newFilters, source);
    },
    [searchQuery, source, router, fetchAnime]
  );

  const handleProviderChange = useCallback(
    (providerId: string) => {
      setSource(providerId);
      // FIXED: Synchronize explicit UI provider choices down to storage
      if (typeof window !== "undefined") {
        localStorage.setItem("roxynime_provider", providerId);
      }
      router.replace(buildBrowseUrl(1, searchQuery, filters, providerId), {
        scroll: false,
      });
      fetchAnime(1, searchQuery, filters, providerId);
    },
    [searchQuery, filters, router, fetchAnime]
  );

  // ── Pagination numbers ─────────────────────────────────────────────────────
  // If API says no more pages but we still got a full page, trust the data
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Browse Anime</h1>
            <p className="text-muted-foreground">
              Temukan dan nonton anime favorit kamu
            </p>
          </div>
          <ProviderSelector onProviderChange={handleProviderChange} />
        </div>
      </div>

      {/* Ad — Top banner */}
      <BannerAd slot="browse-top" className="mb-4" />
      <NativeAd slot="browse-after-top" />

      {/* Search & Filters */}
      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Status bar */}
          {!loading && !error && (
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? `Hasil untuk "${searchQuery}"`
                : `Anime ${filters.type || "completed"}`}
              {animes.length > 0 &&
                ` • Halaman ${currentPage}${effectiveTotalPages > 1 ? ` dari ${effectiveTotalPages}` : ""} • ${animes.length} judul`}
            </p>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-destructive font-medium">{error}</p>
              <button
                onClick={() => fetchAnime(currentPage, searchQuery, filters, source)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && <AnimeGrid animes={animes} loading={loading} />}

          {/* Ad — after grid */}
          <InFeedAd slot="browse-after-grid" />
          <NativeAd slot="browse-inside" />

          {/* FIXED: Kalau hasil filter kosong tapi API masih punya → tampilkan info */}
          {!loading && !error && animes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <p className="text-xl">😕</p>
              <p className="text-muted-foreground">Tidak ada anime ditemukan di halaman ini.</p>
              {hasMore ? (
                <p className="text-sm text-muted-foreground">Tapi masih ada halaman berikutnya, silakan klik tombol Next.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Coba ubah filter atau ganti provider.</p>
              )}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {!loading && !error && (animes.length > 0 || hasMore) && (
            <nav
              className="flex items-center justify-center gap-1 mt-8 flex-wrap"
              aria-label="Pagination"
            >
              {/* First page */}
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1 || !hasPrev} // FIXED: perbaiki disable logic (first)
                className="btn-outline p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman pertama"
                aria-label="Halaman pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || !hasPrev} // FIXED: perbaiki disable logic (prev)
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Prev</span>
              </button>

              {/* Page numbers */}
              {pages.map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 py-2 text-muted-foreground select-none"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${p}`}
                    onClick={() => goToPage(p as number)}
                    disabled={currentPage === p}
                    aria-label={`Halaman ${p}`}
                    aria-current={currentPage === p ? "page" : undefined}
                    className={`min-w-[38px] px-3 py-2 rounded-md transition-colors text-sm font-medium
                      ${currentPage === p
                        ? "bg-primary text-primary-foreground cursor-default shadow-sm"
                        : "hover:bg-muted"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore} // FIXED: next disable rule
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                aria-label="Halaman berikutnya"
              >
                <span className="hidden sm:inline text-sm">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last page */}
              <button
                onClick={() => goToPage(effectiveTotalPages)}
                disabled={!hasMore && currentPage >= effectiveTotalPages} // FIXED: disable logic last page
                className="btn-outline p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman terakhir"
                aria-label="Halaman terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </nav>
          )}

          {/* Ad — below pagination */}
          <div className="mt-8 space-y-4">
            <BannerAd slot="browse-post-page-1" />
            <InFeedAd slot="browse-post-page-2" />
            <BannerAd slot="browse-post-page-3" />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:w-[300px] space-y-6 shrink-0">
          <SidebarAd className="hidden lg:flex" />
        </aside>
      </div>

      {/* Mobile bottom ads */}
      <div className="lg:hidden mt-8 space-y-3">
        <InFeedAd slot="browse-mobile-bottom" />
        <BannerAd slot="browse-mobile-footer" />
      </div>
    </div>
  );
}
