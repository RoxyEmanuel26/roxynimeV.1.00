import Link from "next/link";
import Image from "next/image";
import { Play, TrendingUp, Calendar, Film } from "lucide-react";
import { AnimeCard } from "@/components/anime";
import { BannerAd, InFeedAd, NativeAd } from "@/components/ads";
import { getTrendingAnime } from "@/lib/animbus";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch data in parallel
  const [ongoingData] = await Promise.all([
    getTrendingAnime(),
  ]);

  const featured = ongoingData[0];

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
                    href={`/anime/${featured.id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    Watch Now
                  </Link>
                  <Link
                    href={`/anime/${featured.id}`}
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

      {/* TRENDING NOW SECTION - STYLED LIKE "YOU MAY ALSO LIKE" */}
      {ongoingData.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Section Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                🔥 Trending Now
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Most popular anime this week
              </p>
            </div>

            {/* Responsive Grid - Maximum 12 cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {ongoingData.slice(0, 12).map((anime) => (
                <AnimeCard
                  key={anime.id || anime.slug || anime.title}
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
