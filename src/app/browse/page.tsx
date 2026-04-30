"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd, InFeedAd, NativeAd } from "@/components/ads";
import { RefreshCw, Zap } from "lucide-react";
import { PaginationControl } from "@/components/common/PaginationControl";
import { useDataSaver } from "@/context/DataSaverContext";
import { DataSaverToggle } from "@/components/common/DataSaverToggle";
import { SAVER_CONFIG } from "@/config/dataSaver";

interface Anime {
  id?: string;
  slug: string;
  title: string;
  image: string;
  episode?: string | number;
  type?: string | string[];
  rating?: number;
  status?: string;
  _source?: string;
}

interface ApiResponse {
  status: string;
  data: Anime[];
  hasNext: boolean;
  hasPrev: boolean;
  current_page: number;
  totalPages: number;
  total_item?: number;
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
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [filters, setFilters] = useState<FilterState>({
    type: "completed",
    genre: "",
    order: "updated",
  });

  // ── Refs ───────────────────────────────────────────────────────────────────
  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);
  const currentPageRef = useRef(1);
  const providerHasNextRef = useRef<Record<string, boolean>>({});
  const { isHemat, addSavedBytes } = useDataSaver();

  // ── Build browse URL from current params ───────────────────────────────────
  const buildBrowseUrl = (
    page: number,
    query: string,
    f: FilterState,
    provider: string = "all"
  ): string => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (f.type) params.set("type", f.type);
    if (f.genre) params.set("genre", f.genre);
    if (provider && provider !== "all") params.set("source", provider);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/browse${qs ? `?${qs}` : ""}`;
  };

  // ── Core fetch — all params explicit, NO closure over state ───────────────
  const fetchAnime = useCallback(async (
    pageNum: number,
    query: string,
    f: FilterState,
    provider: string = "all"
  ) => {
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const fetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);
    setAnimes([]); // Clear immediately when fetching new page/query

    // MODE HEMAT: block all API fetches
    if (isHemat) {
      addSavedBytes(307200); // Catat ~300KB API response yang dihemat
      setAnimes([]);
      setError(SAVER_CONFIG.MESSAGES.api_blocked);
      setLoading(false);
      return;
    }

    const ALL_PROVIDERS = ["otakudesu", "samehadaku", "donghua", "anoboy", "winbu"];

    if (pageNum === 1) {
        providerHasNextRef.current = {};
    }

    // If a specific provider is selected, only fetch from that one
    const providersToFetch = provider !== "all"
        ? [provider]
        : ALL_PROVIDERS.filter(p => 
            pageNum === 1 || providerHasNextRef.current[p] !== false
          );
    
    let activeProvidersCount = providersToFetch.length;

    if (activeProvidersCount === 0) {
        setLoading(false);
        setHasMore(false);
        return;
    }

    let anyHasPrev = pageNum > 1;
    let maxTotalPages = pageNum;
    let totalItemsAcc = 0;

    const promises = providersToFetch.map(async (provider) => {
        let url: string;
        if (query) {
            url = `/api/anime/search?q=${encodeURIComponent(query)}&page=${pageNum}&source=${provider}`;
        } else if (f.genre) {
            url = `/api/anime?genre=${encodeURIComponent(f.genre)}&page=${pageNum}&source=${provider}`;
        } else {
            url = `/api/anime?type=${f.type || "completed"}&page=${pageNum}&source=${provider}`;
        }

        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { provider, data: await response.json() as ApiResponse, success: true };
    });

    try {
        const results = await Promise.allSettled(promises);
        if (fetchId !== fetchIdRef.current) return;

        let anySuccess = false;
        let anyHasNext = false;
        const newAnimes: any[] = [];

        results.forEach(res => {
            if (res.status === "fulfilled" && res.value.success) {
                const { provider, data } = res.value;
                providerHasNextRef.current[provider] = !!data.hasNext;
                anySuccess = true;
                
                if (data.hasNext) anyHasNext = true;
                if (data.totalPages > maxTotalPages) maxTotalPages = data.totalPages;
                if (data.total_item) totalItemsAcc += data.total_item;

                const list = (data.data || []).map((anime: any) => {
                    // Format episode display
                    let epDisplay = anime.episode;
                    if (!epDisplay && anime.totalEpisodes) {
                        epDisplay = `${anime.totalEpisodes} Eps`;
                    }
                    // If episode is just a raw number, format it
                    if (epDisplay && /^\d+$/.test(String(epDisplay))) {
                        epDisplay = `${epDisplay} Eps`;
                    }
                    
                    // Fallback to status if episode is missing
                    if (!epDisplay && anime.status && anime.status !== "Unknown" && anime.status !== "null") {
                        epDisplay = anime.status;
                    }

                    // Parse rating using regex to catch numbers hiding in strings like "⭐ 8.5"
                    let ratingVal = undefined;
                    const rawRating = anime.rating || anime.score;
                    if (rawRating) {
                        const match = String(rawRating).match(/(\d+(\.\d+)?)/);
                        if (match) ratingVal = parseFloat(match[1]);
                    }

                    // Determine status badge
                    const status = anime.status || "";
                    const isCompleted = f.type === "completed" || status.toLowerCase().includes("completed");
                    
                    return {
                        ...anime,
                        id: anime.id || anime.slug || "",
                        type: isCompleted ? ["Completed"] : (anime.type ? (Array.isArray(anime.type) ? anime.type : [anime.type]) : undefined),
                        episode: epDisplay,
                        rating: ratingVal && !isNaN(ratingVal) ? ratingVal : undefined,
                        status,
                        genres: anime.genres || [],
                    };
                });
                newAnimes.push(...list);
            } else {
                let providerStr = "unknown";
                if (res.status === "fulfilled") providerStr = res.value.provider;
                providerHasNextRef.current[providerStr] = false; // Prevent zombie retry
                console.error(`[Browse] Fetch error for ${providerStr}`);
            }
        });

        if (!anySuccess) {
            setLoading(false);
            setError("Gagal memuat data anime. Silakan coba lagi.");
            setHasMore(anyHasNext);
            setHasPrev(anyHasPrev);
            setTotalPages(anyHasNext && maxTotalPages <= pageNum ? pageNum + 1 : maxTotalPages);
            setCurrentPage(pageNum);
            return;
        }

        setAnimes(() => {
            const seenKeys = new Set();
            const uniqueItems = newAnimes.filter(anime => {
                const key = anime.slug || anime.id || anime.title?.toLowerCase().trim();
                if (!key || seenKeys.has(key)) return false;
                seenKeys.add(key);
                return true;
            });

            if (f.order === "rating") {
                uniqueItems.sort((a: any, b: any) => {
                    const ra = a.rating || 0;
                    const rb = b.rating || 0;
                    return rb - ra;
                });
            } else if (f.order === "title") {
                uniqueItems.sort((a: any, b: any) => {
                    const ta = (a.title || "").toLowerCase();
                    const tb = (b.title || "").toLowerCase();
                    return ta.localeCompare(tb);
                });
            } else {
                // For 'updated' or default, we maintain the original API order
                // The API already returns them sorted by recently updated
            }
            
            return uniqueItems;
        });
        
        setLoading(false);
        setHasMore(anyHasNext);
        setHasPrev(anyHasPrev);
        setTotalPages(anyHasNext && maxTotalPages <= pageNum ? pageNum + 1 : maxTotalPages);
        setTotalItems(totalItemsAcc > 0 ? totalItemsAcc : undefined);
        setCurrentPage(pageNum);

        if (pageNum !== currentPageRef.current) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        currentPageRef.current = pageNum;

    } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(`[Browse] Promise.allSettled error:`, err);
    }
  }, [isHemat, addSavedBytes]);

  // ── Mount: initialise state from URL then fetch ────────────────────────────
  useEffect(() => {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const query = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const genre = searchParams.get("genre") || "";
    const f: FilterState = { type, genre, order: "updated" };

    setSearchQuery(query);
    setFilters(f);
    setCurrentPage(page);

    const source = searchParams.get("source") || "all";
    setSelectedProvider(source);

    fetchAnime(page, query, f, source);

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Navigation — update URL + fetch directly, NO useEffect chain ──────────
  const goToPage = useCallback(
    (page: number) => {
      if (loading) return;
      const clamped = Math.max(1, page);
      router.replace(buildBrowseUrl(clamped, searchQuery, filters, selectedProvider), {
        scroll: false,
      });
      fetchAnime(clamped, searchQuery, filters, selectedProvider);
    },
    [loading, router, searchQuery, filters, selectedProvider, fetchAnime]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      router.replace(buildBrowseUrl(1, query, filters, selectedProvider), { scroll: false });
      fetchAnime(1, query, filters, selectedProvider);
    },
    [filters, selectedProvider, router, fetchAnime]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      router.replace(buildBrowseUrl(1, searchQuery, newFilters, selectedProvider), {
        scroll: false,
      });
      fetchAnime(1, searchQuery, newFilters, selectedProvider);
    },
    [searchQuery, selectedProvider, router, fetchAnime]
  );

  const handleProviderChange = useCallback(
    (newProvider: string) => {
      setSelectedProvider(newProvider);
      router.replace(buildBrowseUrl(1, searchQuery, filters, newProvider), {
        scroll: false,
      });
      fetchAnime(1, searchQuery, filters, newProvider);
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
  // MODE HEMAT: show dedicated UI
  if (isHemat) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Zap className="h-8 w-8 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">⚡ Mode Hemat Data Aktif</h2>
            <p className="text-white/50 text-sm max-w-sm">
              Semua konten anime dimatikan untuk menghemat kuota internet Anda.
              Matikan Mode Hemat untuk melihat daftar anime.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-amber-400">~80%</p>
              <p className="text-[10px] text-white/40">Kuota dihemat</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-green-400">0 MB</p>
              <p className="text-[10px] text-white/40">Gambar dimuat</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-blue-400">0 API</p>
              <p className="text-[10px] text-white/40">Request dibuat</p>
            </div>
          </div>
          <DataSaverToggle />
          <p className="text-xs text-white/30">Klik ikon ⚡ di navbar untuk toggle Mode Hemat</p>
          <div className="w-full max-w-2xl">
            <BannerAd adKey="1d4f1463e95b8d3fb84adadeb3a2f170" width={728} height={90} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-1 sm:mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-0.5 sm:mb-1">Browse Anime</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Temukan dan nonton anime favorit kamu
            </p>
          </div>
        </div>
      </div>

      {/* FIXED: Ads — Top banner — responsive desktop/mobile */}
      <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90}
        className="mb-6 hidden lg:flex justify-center" />
      <BannerAd adKey="2773304d8f72b4fe1e803cf5cf08230a" width={320} height={50}
        className="mb-4 flex lg:hidden justify-center" />

      {/* Search & Filters */}
      <SearchFilter
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onProviderChange={handleProviderChange}
        selectedProvider={selectedProvider}
        className="mb-4 sm:mb-6 lg:mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Status bar */}
          {!loading && !error && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              {searchQuery
                ? `Hasil untuk "${searchQuery}"`
                : `Anime ${filters.type || "completed"}`}
              {selectedProvider !== "all" && ` dari ${selectedProvider}`}
              {animes.length > 0 &&
                ` • Halaman ${currentPage}${effectiveTotalPages > 1 ? ` dari ${effectiveTotalPages}` : ""} • ${animes.length} judul`}
            </p>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <p className="text-destructive font-medium">{error}</p>
              <button
                onClick={() => fetchAnime(currentPage, searchQuery, filters)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && <AnimeGrid animes={animes} loading={loading} />}

          {/* FIXED: Ads — after grid */}
          <NativeAd set="A" className="my-4" />
          <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />

          {/* FIXED: Kalau hasil filter kosong tapi API masih punya → tampilkan info */}
          {!loading && !error && animes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <p className="text-xl">😕</p>
              <p className="text-muted-foreground">Tidak ada anime ditemukan di halaman ini.</p>
              {hasMore ? (
                <p className="text-sm text-muted-foreground">Tapi masih ada halaman berikutnya, silakan klik tombol Next.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Coba ubah filter pencarian Anda.</p>
              )}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {(animes.length > 0 || hasMore) && (
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              hasMore={hasMore}
              hasPrev={hasPrev}
              loading={loading}
              totalItems={totalItems}
              onPageChange={goToPage}
            />
          )}

          {/* FIXED: Ads — below pagination */}
          <div className="mt-8 space-y-4">
            <NativeAd set="B" className="my-4" />
            <InFeedAd adKey="0184ead2c935ee466bea96058347d06d" width={300} height={250} />
          </div>
        </div>

        {/* FIXED: Sidebar — sticky banners desktop only */}
        <SidebarAd />
      </div>

      {/* FIXED: Mobile bottom ads */}
      <div className="lg:hidden mt-8 space-y-3">
        <BannerAd adKey="aba7098d25b574b0f3cda75504b6f8e6" width={320} height={50}
          className="justify-center" />
      </div>
    </div>
  );
}
