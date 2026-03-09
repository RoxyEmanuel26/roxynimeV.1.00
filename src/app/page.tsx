import Link from "next/link";
import { Metadata } from "next";
import { Play, TrendingUp, Calendar, Film } from "lucide-react";
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

const PROVIDERS = ["otakudesu", "samehadaku", "donghua", "anoboy", "oploverz"];

// Deterministic shuffle using a seed (so it's constant for SEO bots for a day, but changes daily)
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default async function HomePage() {
  // FIXED: Server component uses direct data layer call to avoid HTTP connection drops
  const fetchPromises = PROVIDERS.map((provider) =>
    getOngoingAnimeList(1, provider)
      .then((res) => res.data || [])
      .catch((err) => {
        console.error(`[Home] Error fetching provider ${provider}:`, err);
        return [];
      })
  );

  const results = await Promise.allSettled(fetchPromises);

  let hasNetworkError = false;
  const successCount = results.filter((r) => r.status === "fulfilled").length;
  if (successCount === 0) hasNetworkError = true;

  const allAnimes: Anime[] = [];
  const seenTitles = new Set<string>();

  results.forEach((result) => {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      result.value.forEach((anime: any) => {
        // Deduplicate by title (case-insensitive)
        const key = anime.title?.toLowerCase().trim();
        if (key && !seenTitles.has(key)) {
          seenTitles.add(key);
          allAnimes.push(anime as Anime);
        }
      });
    }
  });

  // Shuffle intelligently based on today's date so the SSR UI is stable for the day
  let seed = new Date().setHours(0, 0, 0, 0) / 100000;
  let m = allAnimes.length, t, i;
  while (m) {
    i = Math.floor(seededRandom(seed++) * m--);
    t = allAnimes[m];
    allAnimes[m] = allAnimes[i];
    allAnimes[i] = t;
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

      {/* Quick Links Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <Link
              href="/browse?type=ongoing"
              className="glass-card p-6 hover:bg-muted/50 transition-colors text-center group"
            >
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Ongoing</h3>
              <p className="text-xs text-muted-foreground mt-1">Currently Airing</p>
            </Link>
            <Link
              href="/browse?type=completed"
              className="glass-card p-6 hover:bg-muted/50 transition-colors text-center group"
            >
              <Film className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Completed</h3>
              <p className="text-xs text-muted-foreground mt-1">Finished Series</p>
            </Link>
            <Link
              href="/browse?type=movie"
              className="glass-card p-6 hover:bg-muted/50 transition-colors text-center group"
            >
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">Movies</h3>
              <p className="text-xs text-muted-foreground mt-1">Anime Films</p>
            </Link>
            <Link
              href="/browse"
              className="glass-card p-6 hover:bg-muted/50 transition-colors text-center group"
            >
              <Play className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold">All Anime</h3>
              <p className="text-xs text-muted-foreground mt-1">Browse Everything</p>
            </Link>
          </div>
        </div>
      </section>

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
