"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeGrid, SearchFilter, type FilterState } from "@/components/anime";
import { BannerAd, SidebarAd, InFeedAd, NativeAd } from "@/components/ads";
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Zap } from "lucide-react";
import { useDataSaver } from "@/context/DataSaverContext";
import { DataSaverToggle } from "@/components/common/DataSaverToggle";
import { SAVER_CONFIG } from "@/config/dataSaver";

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
  const [hasPrev, setHasPrev] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "ongoing",
    genre: "",
    order: "updated",
  });

  const abortRef = useRef<AbortController | null>(null);
  const fetchIdRef = useRef(0);
  const currentPageRef = useRef(1);
  const { isHemat, addSavedBytes } = useDataSaver();

  // FIXED: always write source to URL so it stays in sync
  const buildUrl = (page: number, query: string, f: FilterState): string => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (f.genre) params.set("genre", f.genre);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/ongoing${qs ? `?${qs}` : ""}`;
  };

  const fetchAnime = useCallback(async (
    pageNum: number,
    query: string,
    f: FilterState
  ) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const fetchId = ++fetchIdRef.current;

    setLoading(true);
    setError(null);
    // FIXED: Pertahankan data lama saat loading agar grid tidak kosong

    // MODE HEMAT: block all API fetches
    if (isHemat) {
      addSavedBytes(307200); // Catat ~300KB API response yang dihemat
      setAnimes([]);
      setError(SAVER_CONFIG.MESSAGES.api_blocked);
      setLoading(false);
      return;
    }

    const ALL_PROVIDERS = ["anoboy", "otakudesu", "samehadaku", "donghua", "oploverz", "kuramanime"];
    
    let activeProviders = ALL_PROVIDERS.length;
    let anyHasNext = false;
    let anyHasPrev = pageNum > 1;
    let maxTotalPages = pageNum;
    let anySuccess = false;

    ALL_PROVIDERS.forEach(async (provider) => {
        try {
            let url: string;
            if (query) {
                url = `/api/anime/search?q=${encodeURIComponent(query)}&page=${pageNum}&source=${provider}`;
            } else if (f.genre) {
                url = `/api/anime?genre=${encodeURIComponent(f.genre)}&page=${pageNum}&source=${provider}`;
            } else {
                url = `/api/anime?type=ongoing&page=${pageNum}&source=${provider}`;
            }

            const response = await fetch(url, { signal: controller.signal });
            if (fetchId !== fetchIdRef.current) return;
            if (!response.ok) return;

            const data: ApiResponse = await response.json();
            if (fetchId !== fetchIdRef.current) return;
            
            anySuccess = true;

            // NORMALIZATION
            let list = (data.data || []).map((anime: any) => ({
                ...anime,
                id: anime.id || anime.slug || "",
                type: anime.type,
                genres: anime.genres || [],
            }));

            // Tolerant status filter — providers use varied status strings
            list = list.filter((anime: any) => {
                const status = (anime.status || "").toLowerCase().trim();
                if (!status) return true; // empty = assume ongoing
                if (status.includes("ongoing")) return true;
                if (status.includes("airing")) return true;
                if (status.includes("sedang")) return true;
                if (status.includes("belum tamat")) return true;
                // Explicitly reject non-ongoing statuses
                if (status.includes("completed")) return false;
                if (status.includes("finished")) return false;
                if (status.includes("tamat")) return false;
                if (status.includes("movie")) return false;
                if (status.includes("film")) return false;
                // Unknown status = show (prefer over-include)
                return true;
            });

            if (data.hasNext) anyHasNext = true;
            if (data.totalPages > maxTotalPages) maxTotalPages = data.totalPages;

            setAnimes(prev => {
                const seenKeys = new Set(prev.map(a => a.slug || a.id || a.title?.toLowerCase().trim()));
                const newItems = list.filter((anime: any) => {
                    const key = anime.slug || anime.id || anime.title?.toLowerCase().trim();
                    if (!key || seenKeys.has(key)) return false;
                    seenKeys.add(key);
                    return true;
                });
                
                let merged = [...prev, ...newItems];

                if (f.order === "rating") {
                    merged.sort((a: any, b: any) => {
                        const ra = parseFloat(a.rating || a.score || "0") || 0;
                        const rb = parseFloat(b.rating || b.score || "0") || 0;
                        return rb - ra;
                    });
                }
                
                return merged;
            });
            
            if (list.length > 0) {
                setLoading(false);
            }

        } catch (err: any) {
            if (err?.name === "AbortError") return;
            console.error(`[Ongoing] Fetch error for ${provider}:`, err);
        } finally {
            if (fetchId === fetchIdRef.current) {
                activeProviders--;
                if (activeProviders === 0) {
                    setLoading(false);
                    if (!anySuccess) setError("Gagal memuat data anime. Silakan coba lagi.");
                    
                    setHasMore(anyHasNext);
                    setHasPrev(anyHasPrev);
                    setTotalPages(anyHasNext && maxTotalPages <= pageNum ? pageNum + 1 : maxTotalPages);
                    setCurrentPage(pageNum);

                    if (pageNum !== currentPageRef.current) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    currentPageRef.current = pageNum;
                }
            }
        }
    });
  }, []);

  // FIXED: URL params always take priority over localStorage
  useEffect(() => {
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const query = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const f: FilterState = { type: "ongoing", genre, order: "updated" };

    setSearchQuery(query);
    setFilters(f);
    setCurrentPage(page);
    fetchAnime(page, query, f);

    return () => { if (abortRef.current) abortRef.current.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToPage = useCallback((page: number) => {
    if (loading) return;
    const p = Math.max(1, page);
    router.replace(buildUrl(p, searchQuery, filters), { scroll: false });
    fetchAnime(p, searchQuery, filters);
  }, [loading, router, searchQuery, filters, fetchAnime]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    router.replace(buildUrl(1, query, filters), { scroll: false });
    fetchAnime(1, query, filters);
  }, [filters, router, fetchAnime]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    const f = { ...newFilters, type: "ongoing" };
    setFilters(f);
    router.replace(buildUrl(1, searchQuery, f), { scroll: false });
    fetchAnime(1, searchQuery, f);
  }, [searchQuery, router, fetchAnime]);

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1">Ongoing Anime</h1>
            <p className="text-muted-foreground">
              Anime yang sedang tayang saat ini
            </p>
          </div>
        </div>
      </div>

      {/* FIXED: Ads — Top banner — responsive */}
      <BannerAd adKey="1d4f1463e95b8d3fb84adadeb3a2f170" width={728} height={90}
        className="mb-6 hidden lg:flex justify-center" />
      <BannerAd adKey="2773304d8f72b4fe1e803cf5cf08230a" width={320} height={50}
        className="mb-4 flex lg:hidden justify-center" />

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
                onClick={() => fetchAnime(currentPage, searchQuery, filters)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}

          {!error && <AnimeGrid animes={animes} loading={loading} />}

          {/* FIXED: Ads — after grid */}
          <NativeAd set="A" className="my-4" />
          <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />

          {/* FIXED: Kalau hasil filter kosong tapi API masih punya → tampilkan info */}
          {!loading && !error && animes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
              <p className="text-xl">😕</p>
              <p className="text-muted-foreground">Tidak ada anime ongoing ditemukan di halaman ini.</p>
              {hasMore ? (
                <p className="text-sm text-muted-foreground">Tapi masih ada halaman berikutnya, silakan klik tombol Next.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Coba gunakan filter pencarian lain.</p>
              )}
            </div>
          )}

          {/* ── Pagination ──────────────────────────────────────────────── */}
          {!loading && !error && (animes.length > 0 || hasMore) && (
            <nav className="flex items-center justify-center gap-1 mt-8 flex-wrap" aria-label="Pagination">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1 || !hasPrev} // FIXED: logic first page
                className="btn-outline p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Halaman pertama"
                aria-label="Halaman pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || !hasPrev} // FIXED: logic prev page
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Prev</span>
              </button>

              {pages.map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-2 text-muted-foreground select-none" aria-hidden>
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
                        : "hover:bg-muted"}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={!hasMore} // FIXED: next disable rule
                className="btn-outline px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                aria-label="Halaman berikutnya"
              >
                <span className="hidden sm:inline text-sm">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

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
