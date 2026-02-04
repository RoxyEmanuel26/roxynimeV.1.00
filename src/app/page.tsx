import Link from "next/link";
import Image from "next/image";
import { Play, TrendingUp, Calendar, Film } from "lucide-react";
import { AnimeCarousel } from "@/components/anime";
import { BannerAd, SidebarAd } from "@/components/ads";
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
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        {featured && (
          <div className="absolute inset-0">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                Featured
              </span>
              {featured?.type && (
                <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm">
                  {featured.type}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {featured?.title || "Welcome to RoxyNime"}
            </h1>

            <p className="text-lg text-muted-foreground line-clamp-3">
              {featured
                ? `Watch ${featured.title} now! Latest episode available.`
                : "Your ultimate destination for streaming anime in HD quality."}
            </p>

            <div className="flex flex-wrap gap-4">
              {featured ? (
                <Link
                  href={`/anime/${featured.id}`}
                  className="btn-primary text-lg px-8 py-3"
                >
                  <Play className="h-5 w-5 fill-current" />
                  Watch Now
                </Link>
              ) : (
                <Link href="/browse" className="btn-primary text-lg px-8 py-3">
                  <Play className="h-5 w-5 fill-current" />
                  Browse Anime
                </Link>
              )}
              <Link href="/browse" className="btn-outline text-lg px-8 py-3">
                Explore All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-12">
            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/browse?type=ongoing"
                className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors glow-hover"
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Ongoing</p>
                  <p className="text-xs text-muted-foreground">Latest episodes</p>
                </div>
              </Link>
              <Link
                href="/browse?type=completed"
                className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors glow-hover"
              >
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-xs text-muted-foreground">Finished series</p>
                </div>
              </Link>
              <Link
                href="/browse?type=movie"
                className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors glow-hover"
              >
                <div className="p-3 rounded-lg bg-accent/10">
                  <Film className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium">Movies</p>
                  <p className="text-xs text-muted-foreground">Anime films</p>
                </div>
              </Link>
              <Link
                href="/browse"
                className="glass-card p-4 flex items-center gap-3 hover:bg-primary/5 transition-colors glow-hover"
              >
                <div className="p-3 rounded-lg bg-success/10">
                  <Play className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-medium">All Anime</p>
                  <p className="text-xs text-muted-foreground">Browse catalog</p>
                </div>
              </Link>
            </div>

            {/* Ongoing Anime */}
            <AnimeCarousel
              title="🔥 Ongoing Anime"
              subtitle="Latest episodes updated daily"
              animes={ongoingData}
            />

            {/* Banner Ad */}
            <BannerAd />

            {/* Completed Anime & Movies sections removed for now as Animbus doesn't support them specifically yet */}

          </div>

          {/* Sidebar */}
          <aside className="lg:w-[300px] space-y-6">
            {/* Sidebar Ad */}
            <SidebarAd className="hidden lg:flex" />

            {/* Top Anime */}
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {ongoingData.slice(0, 5).map((anime, index) => {
                  return (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <Image
                        src={anime.image}
                        alt={anime.title}
                        width={40}
                        height={60}
                        className="rounded object-cover"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{anime.title}</p>
                        <p className="text-xs text-muted-foreground">{anime.episode}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      <div className="lg:hidden p-4">
        <SidebarAd className="w-full h-[100px]" />
      </div>
    </div>
  );
}
