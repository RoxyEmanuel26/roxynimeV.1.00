/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import Link from "next/link";
import { BannerAd, InFeedAd, NativeAd } from "@/components/ads";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestEpisodesSection } from "@/components/home/LatestEpisodesSection";
import { getOngoingAnimeList, getCompletedAnimeList, getMoviesList, getAnimeInfo } from "@/lib/animbus";
import type { Anime } from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "Nonton Anime Sub Indo Gratis — Streaming HD Terbaru | RoxyNime",
  description: "Nonton streaming anime sub indo online gratis kualitas HD. Update episode terbaru setiap hari. Ribuan judul anime ongoing, completed, dan movie lengkap subtitle Indonesia.",
  alternates: { canonical: "https://roxy.my.id" },
  openGraph: {
    title: "Nonton Anime Sub Indo Gratis — Streaming HD Terbaru | RoxyNime",
    description: "Nonton streaming anime sub indo online gratis kualitas HD. Update episode terbaru setiap hari. Ribuan judul anime ongoing, completed, dan movie.",
    type: "website",
    locale: "id_ID",
    siteName: "RoxyNime",
    url: "https://roxy.my.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nonton Anime Sub Indo Gratis — Streaming HD | RoxyNime",
    description: "Streaming anime sub indo gratis kualitas HD. Update episode terbaru setiap hari.",
  },
};

// ISR: Revalidate home page setiap 5 menit
export const revalidate = 300;

// Helper timeout wrapper
async function fetchWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs = 3000
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), timeoutMs)
    );
    return Promise.race([promise, timeout]);
}

const PROVIDER = "otakudesu";

// Helper: map raw API anime into standard Anime shape
function normalizeAnime(a: any, provider: string, overrideStatus?: string): Anime {
    let epDisplay = a.episode;
    if (!epDisplay && a.totalEpisodes) {
        epDisplay = `${a.totalEpisodes} Eps`;
    }
    if (epDisplay && /^\d+$/.test(String(epDisplay))) {
        epDisplay = `${epDisplay}`;
    }
    if (!epDisplay && a.status && a.status !== "Unknown" && a.status !== "null") {
        epDisplay = a.status;
    }

    let ratingVal: number | undefined = undefined;
    const rawRating = a.rating || a.score;
    if (rawRating) {
        const match = String(rawRating).match(/(\d+(\.\d+)?)/);
        if (match) ratingVal = parseFloat(match[1]);
    }

    return {
        ...a,
        _source: provider,
        episode: epDisplay,
        rating: ratingVal && !isNaN(ratingVal) ? ratingVal : undefined,
        status: overrideStatus || a.status || "Ongoing",
    };
}

/**
 * Server-side synopsis enrichment — runs during ISR build only (every 5 min).
 * 
 * ⚠️ RATE LIMIT AWARENESS:
 * Sanka API = 50 requests/minute. This page already uses 3 requests for
 * list endpoints (ongoing, completed, movies). That leaves ~47 for detail.
 * 
 * Safety measures:
 * - MAX_ENRICH = 20 items only (not all 50+)
 * - MAX_CONCURRENT = 3 (not 5)
 * - 2-second delay between batches → max ~21 requests/minute
 * - getCachedData (L2 DB cache, 1h TTL) prevents actual API hits most of the time
 * - Worst case (full cold start): 3 + 20 = 23 requests, well under 50/min
 */
async function enrichWithSynopsis(animes: Anime[], provider: string): Promise<Anime[]> {
    const MAX_ENRICH = 20;     // Only enrich first 20 anime (rate limit safety)
    const MAX_CONCURRENT = 3;  // Max parallel requests per batch
    const BATCH_DELAY_MS = 2000; // 2-second pause between batches
    const TIMEOUT_MS = 3000;
    const results = [...animes];

    // Only enrich up to MAX_ENRICH items to stay under rate limit
    const enrichCount = Math.min(results.length, MAX_ENRICH);

    for (let i = 0; i < enrichCount; i += MAX_CONCURRENT) {
        // Add delay between batches (except the first one)
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        }

        const batch = results.slice(i, Math.min(i + MAX_CONCURRENT, enrichCount));
        const enriched = await Promise.allSettled(
            batch.map(async (anime) => {
                // Skip if already has description or is an episode slug
                if (anime.description && anime.description.trim()) return anime;
                const slug = anime.id || anime.slug;
                if (!slug) return anime;
                const lower = slug.toLowerCase();
                if (/-episode-\d+/.test(lower) || /-eps-\d+/.test(lower)) return anime;

                try {
                    const detail = await fetchWithTimeout(
                        getAnimeInfo(slug, provider),
                        TIMEOUT_MS
                    );
                    return {
                        ...anime,
                        description: detail.synopsis || detail.description || anime.description || "",
                        genres: detail.genres || anime.genres,
                    } as Anime;
                } catch {
                    return anime; // Keep original on failure
                }
            })
        );

        // Write back enriched results
        enriched.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                results[i + idx] = result.value;
            }
        });
    }

    return results;
}

export default async function HomePage() {
  // ═══ Fetch all data in parallel ═══
  const [ongoingData, completedData, moviesData] = await Promise.all([
    // Ongoing from otakudesu
    fetchWithTimeout(getOngoingAnimeList(1, PROVIDER), 5000)
      .then((res) => (res.data || []).map((a: any) => normalizeAnime(a, PROVIDER, "Ongoing")))
      .catch((err) => {
        console.error(`[Home] Error fetching ongoing:`, err?.message || err);
        return [] as Anime[];
      }),
    // Completed from otakudesu
    fetchWithTimeout(getCompletedAnimeList(1, PROVIDER), 5000)
      .then((res) => (res.data || []).map((a: any) => normalizeAnime(a, PROVIDER, "Completed")))
      .catch((err) => {
        console.error(`[Home] Error fetching completed:`, err?.message || err);
        return [] as Anime[];
      }),
    // Movies from samehadaku
    fetchWithTimeout(getMoviesList(1, "samehadaku"), 5000)
      .then((res) => (res.data || []).map((a: any) => ({
        ...normalizeAnime(a, "samehadaku", "Movie"),
        type: ["Movie"],
      })))
      .catch((err) => {
        console.error(`[Home] Error fetching movies:`, err?.message || err);
        return [] as Anime[];
      }),
  ]);

  const hasNetworkError = ongoingData.length === 0 && completedData.length === 0 && moviesData.length === 0;

  // Single provider — no deduplication needed for ongoing/completed
  const allOngoing = ongoingData;
  const allCompleted = completedData;

  // Merge all for "Trending Now" (interleave ongoing + completed + movies for variety)
  const allAnimes: Anime[] = [];
  const mergedSeen = new Set<string>();
  const maxLen = Math.max(allOngoing.length, allCompleted.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < allOngoing.length) {
      const key = allOngoing[i].title?.toLowerCase() || allOngoing[i].slug || "";
      if (key && !mergedSeen.has(key)) {
        mergedSeen.add(key);
        allAnimes.push(allOngoing[i]);
      }
    }
    if (i < allCompleted.length) {
      const key = allCompleted[i].title?.toLowerCase() || allCompleted[i].slug || "";
      if (key && !mergedSeen.has(key)) {
        mergedSeen.add(key);
        allAnimes.push(allCompleted[i]);
      }
    }
  }
  // Append movies at the end (they show when "Movie" filter is selected)
  for (const movie of moviesData) {
    const key = movie.title?.toLowerCase() || movie.slug || "";
    if (key && !mergedSeen.has(key)) {
      mergedSeen.add(key);
      allAnimes.push(movie);
    }
  }

  // ═══ Server-side synopsis enrichment (ISR only, not per-user) ═══
  const enrichedAnimes = await enrichWithSynopsis(allAnimes, PROVIDER);

  if (enrichedAnimes.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">{hasNetworkError ? "📡" : "😕"}</span>
          </div>
          <h2 className="text-3xl font-bold">
            {hasNetworkError ? "Koneksi Bermasalah" : "Tidak Ada Konten"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {hasNetworkError
              ? "Gagal menyambung ke server provider anime. Silakan coba beberapa saat lagi."
              : "Semua provider tidak mengembalikan data saat ini."}
          </p>
          <div className="pt-6">
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
              Coba Lagi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══ Top Ad Banner ═══ */}
      <div className="container mx-auto px-4 max-w-7xl">
        <BannerAd adKey="898edf76869e94a70114cced9991b099" width={728} height={90}
          className="my-4 hidden md:flex" />
        <BannerAd adKey="2773304d8f72b4fe1e803cf5cf08230a" width={320} height={50}
          className="my-4 flex md:hidden" />
      </div>

      {/* ═══ TRENDING NOW — Grid with Filter Tabs ═══ */}
      <TrendingSection animes={enrichedAnimes} />

      {/* ═══ Ads Between Sections ═══ */}
      <NativeAd set="A" className="my-4" />
      <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />

      {/* ═══ LATEST EPISODES — Horizontal Cards ═══ */}
      <LatestEpisodesSection animes={allOngoing} />

      {/* ═══ Bottom Ads ═══ */}
      <NativeAd set="B" className="my-4" />
      <div className="container mx-auto px-4 max-w-7xl">
        <BannerAd adKey="dd5f08b2cef41d33b6c75282914cefd4" width={468} height={60}
          className="my-4 hidden sm:flex" />
        <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90}
          className="my-4 hidden lg:flex" />
      </div>
    </div>
  );
}
