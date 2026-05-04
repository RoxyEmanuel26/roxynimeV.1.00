import { Metadata } from "next";
import { BannerAd, InFeedAd, NativeAd } from "@/components/ads";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingSection } from "@/components/home/TrendingSection";
import { getOngoingAnimeList } from "@/lib/animbus";
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

const PROVIDERS = ["otakudesu", "samehadaku", "oploverz"];

export default async function HomePage() {
  // FIXED: Server component uses direct data layer call to avoid HTTP connection drops
  const fetchPromises = PROVIDERS.map((provider) =>
    fetchWithTimeout(getOngoingAnimeList(1, provider), 8000)
      .then((res) => (res.data || []).map((a: any) => {
        let epDisplay = a.episode;
        if (!epDisplay && a.totalEpisodes) {
            epDisplay = `${a.totalEpisodes} Eps`;
        }
        if (epDisplay && /^\d+$/.test(String(epDisplay))) {
            epDisplay = `${epDisplay} Eps`;
        }

        if (!epDisplay && a.status && a.status !== "Unknown" && a.status !== "null") {
            epDisplay = a.status;
        }

        // Parse rating using regex to catch numbers hiding in strings like "⭐ 8.5"
        let ratingVal = undefined;
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
            // Provide explicit status if available, fallback to Ongoing for home page feed
            status: a.status || "Ongoing"
        };
      }))
      .catch((err) => {
        console.error(`[Home] Error fetching provider ${provider}:`, err);
        return [];
      })
  );

  const results = await Promise.allSettled(fetchPromises);

  let hasNetworkError = false;
  const successCount = results.filter((r) => r.status === "fulfilled").length;
  if (successCount === 0) hasNetworkError = true;

  const providerAnimes: any[][] = results.map(r => r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
  const allAnimes: Anime[] = [];
  const seenTitles = new Set<string>();
  const seenSlugs = new Set<string>();

  let hasMore = true;
  let idx = 0;
  while (hasMore) {
    hasMore = false;
    for (let i = 0; i < providerAnimes.length; i++) {
      if (idx < providerAnimes[i].length) {
        hasMore = true;
        const anime = providerAnimes[i][idx];
        
        const titleKey = anime.title?.toLowerCase().trim() || "";
        const slugKey = anime.slug || anime.id || "";
        
        if (!titleKey && !slugKey) continue;

        const isTitleDuplicate = titleKey && seenTitles.has(titleKey);
        const isSlugDuplicate = slugKey && seenSlugs.has(slugKey);

        if (!isTitleDuplicate && !isSlugDuplicate) {
            if (titleKey) seenTitles.add(titleKey);
            if (slugKey) seenSlugs.add(slugKey);
            allAnimes.push(anime as Anime);
        }
      }
    }
    idx++;
  }

  const featured = allAnimes[0];

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
      {/* Hero Section */}
      <HeroSection featured={featured} />

      {/* FIXED: Ads after hero — responsive desktop/mobile */}
      <div className="container mx-auto px-4 max-w-7xl">
        <BannerAd adKey="1d4f1463e95b8d3fb84adadeb3a2f170" width={728} height={90}
          className="my-4 hidden md:flex" />
        <BannerAd adKey="2773304d8f72b4fe1e803cf5cf08230a" width={320} height={50}
          className="my-4 flex md:hidden" />
      </div>

      {/* TRENDING NOW — From ALL Providers */}
      <TrendingSection animes={allAnimes} />

      {/* FIXED: Native ad + rectangle ad between sections */}
      <NativeAd set="A" className="my-4" />
      <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />



      {/* FIXED: Bottom ads — native + banners */}
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
