import { Metadata } from "next";
import { BannerAd, InFeedAd, NativeAd } from "@/components/ads";
import { TrendingSection } from "@/components/home/TrendingSection";
import { LatestEpisodesSection } from "@/components/home/LatestEpisodesSection";
import { getOngoingAnimeList, getCompletedAnimeList } from "@/lib/animbus";
import type { Anime } from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "RoxyNime - Nonton Anime Sub Indo Online",
  description: "Nonton streaming dan download anime sub indo online secara gratis tanpa ribet. Tersedia ribuan judul anime terbaru dan terlengkap.",
  openGraph: {
    title: "RoxyNime - Nonton Anime Sub Indo Online",
    description: "Nonton streaming dan download anime sub indo online secara gratis tanpa ribet. Tersedia ribuan judul anime terbaru dan terlengkap.",
    type: "website",
    locale: "id_ID",
    siteName: "RoxyNime",
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

export default async function HomePage() {
  // ═══ Fetch Ongoing from otakudesu only ═══
  const ongoingData = await fetchWithTimeout(getOngoingAnimeList(1, PROVIDER), 5000)
    .then((res) => (res.data || []).map((a: any) => normalizeAnime(a, PROVIDER, "Ongoing")))
    .catch((err) => {
      console.error(`[Home] Error fetching ongoing:`, err?.message || err);
      return [] as Anime[];
    });

  // ═══ Fetch Completed from otakudesu only ═══
  const completedData = await fetchWithTimeout(getCompletedAnimeList(1, PROVIDER), 4000)
    .then((res) => (res.data || []).map((a: any) => normalizeAnime(a, PROVIDER, "Completed")))
    .catch((err) => {
      console.error(`[Home] Error fetching completed:`, err?.message || err);
      return [] as Anime[];
    });

  const hasNetworkError = ongoingData.length === 0 && completedData.length === 0;

  // Single provider — no deduplication needed
  const allOngoing = ongoingData;
  const allCompleted = completedData;

  // Merge all for "Trending Now" (interleave ongoing + completed for variety)
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

  if (allAnimes.length === 0) {
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
            <a href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
              Coba Lagi
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ═══ Top Ad Banner ═══ */}
      <div className="container mx-auto px-4 max-w-7xl">
        <BannerAd adKey="1d4f1463e95b8d3fb84adadeb3a2f170" width={728} height={90}
          className="my-4 hidden md:flex" />
        <BannerAd adKey="2773304d8f72b4fe1e803cf5cf08230a" width={320} height={50}
          className="my-4 flex md:hidden" />
      </div>

      {/* ═══ TRENDING NOW — Grid with Filter Tabs ═══ */}
      <TrendingSection animes={allAnimes} />

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
