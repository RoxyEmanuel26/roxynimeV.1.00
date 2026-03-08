"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, TrendingUp, Calendar, Film, Loader2 } from "lucide-react";
import { AnimeCard } from "@/components/anime";
import { BannerAd, InFeedAd, NativeAd } from "@/components/ads";

interface Anime {
  id?: string;
  slug: string;
  title: string;
  image: string;
  episode?: string;
  rating?: string;
  type?: string[];
  description?: string;
}

const PROVIDERS = ["otakudesu", "samehadaku", "donghua", "anoboy", "oploverz"];

export default function HomePage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from ALL providers in parallel and merge results
  const fetchAllProviders = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        PROVIDERS.map(async (provider) => {
          const res = await fetch(`/api/anime?type=ongoing&source=${provider}&page=1`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.data || []).map((a: Anime) => ({
            ...a,
            // Tag with provider for deduplication
            _provider: provider,
          }));
        })
      );

      // Merge all successful results
      const allAnimes: Anime[] = [];
      const seenTitles = new Set<string>();

      results.forEach((result) => {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
          result.value.forEach((anime: Anime) => {
            // Deduplicate by title (case-insensitive)
            const key = anime.title?.toLowerCase().trim();
            if (key && !seenTitles.has(key)) {
              seenTitles.add(key);
              allAnimes.push(anime);
            }
          });
        }
      });

      // Shuffle for variety
      const shuffled = allAnimes.sort(() => Math.random() - 0.5);
      setAnimes(shuffled);
    } catch (e) {
      console.error("[Home] Error fetching:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProviders();
  }, [fetchAllProviders]);

  const featured = animes[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          {featured && (
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 max-w-7xl pb-12">
            {featured && (
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                  {featured.title}
                </h1>
                {featured.description && (
                  <p className="text-sm md:text-base text-muted-foreground mb-6 line-clamp-3">
                    {featured.description}
                  </p>
                )}
                <div className="flex gap-4">
                  <Link
                    href={`/anime/${featured.id || featured.slug}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Watch Now
                  </Link>
                  <Link
                    href={`/anime/${featured.id || featured.slug}`}
                    className="btn-outline inline-flex items-center gap-2"
                  >
                    More Info
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ad Layer 1 — After Hero */}
      <BannerAd slot="home-hero" />
      <NativeAd slot="home-after-hero" />

      {/* TRENDING NOW — From ALL Providers */}
      {animes.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Section Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                🔥 Trending Now
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Anime populer dari semua sumber
              </p>
            </div>

            {/* Responsive Grid - Maximum 18 cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {animes.slice(0, 18).map((anime, index) => (
                <AnimeCard
                  key={anime.id || anime.slug || `home-${index}`}
                  id={anime.id || anime.slug || ""}
                  slug={anime.slug}
                  title={anime.title}
                  image={anime.image}
                  episode={anime.episode}
                  rating={anime.rating}
                  type={anime.type}
                />
              ))}
            </div>

            {/* Ad Layer 2 — Inside Trending */}
            <NativeAd slot="home-trending" className="mt-4" />

            {/* View All Button */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Link
                href="/browse"
                className="btn-outline px-6 sm:px-8 py-2 sm:py-3"
              >
                View All Anime
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Ad Layer 3 — Between Sections */}
      <InFeedAd slot="home-mid" />
      <BannerAd slot="home-mid-banner" />

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

      {/* Ad Layer 4 — Page Bottom */}
      <InFeedAd slot="home-bottom" />
      <BannerAd slot="home-footer" />
    </div>
  );
}
