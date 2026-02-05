import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Play, Calendar, Star, Tag, Users } from "lucide-react";
import { AnimeCard } from "@/components/anime/AnimeCard";
import { SidebarAd, BannerAd } from "@/components/ads";
import { getAnimeInfo, getTrendingAnime } from "@/lib/animbus";

export const revalidate = 3600; // Revalidate every hour

interface AnimeDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function AnimeDetailPage({
    params,
}: AnimeDetailPageProps) {
    const { id } = await params;

    // Fetch anime details and related anime
    const [anime, relatedAnime] = await Promise.all([
        getAnimeInfo(id),
        getTrendingAnime(),
    ]);

    if (!anime) {
        notFound();
    }

    // Debug logging
    console.log('Anime Detail Data:', {
        id,
        title: anime.title,
        hasEpisodes: !!anime.episodes,
        episodeCount: anime.episodes?.length || 0,
        hasImage: !!(anime.poster || anime.image),
        status: anime.status,
        count: anime.episodes?.length,
        genres: anime.genres,
    });

    // Get episodes list
    const episodes = anime.episodes || [];

    return (
        <div className="min-h-screen">
            {/* Hero Banner */}
            <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
                <Image
                    src={anime.poster || anime.image || "/placeholder-anime.svg"}
                    alt={anime.title || "Anime poster"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-32 relative z-10">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left: Poster */}
                    <div className="flex-shrink-0 mx-auto lg:mx-0">
                        <div className="relative w-[200px] sm:w-[250px] md:w-[300px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                            <Image
                                src={anime.poster || anime.image || "/placeholder-anime.svg"}
                                alt={anime.title || "Anime cover"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
                                priority
                            />
                        </div>
                    </div>

                    {/* Center: Info */}
                    <div className="flex-1 space-y-4 sm:space-y-6">
                        {/* Title */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                                {anime.title}
                            </h1>
                            {anime.japaneseTitle && (
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    {anime.japaneseTitle}
                                </p>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                            {anime.type && (
                                <div className="flex items-center gap-1.5">
                                    <Tag className="h-4 w-4 text-primary" />
                                    <span>{anime.type}</span>
                                </div>
                            )}
                            {anime.status && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>{anime.status}</span>
                                </div>
                            )}
                            {anime.rating && (
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span>{anime.rating}</span>
                                </div>
                            )}
                        </div>

                        {/* Genres */}
                        {anime.genres && anime.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {anime.genres.map((genre: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Synopsis */}
                        {anime.synopsis && (
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                                    Synopsis
                                </h2>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                    {anime.synopsis}
                                </p>
                            </div>
                        )}

                        {/* Watch Button */}
                        {episodes.length > 0 && (
                            <Link
                                href={`/watch/${id}/${episodes[0].id || episodes[0].urlSlug || 1}`}
                                className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base"
                            >
                                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                                Watch Now
                            </Link>
                        )}

                        {/* Episodes List */}
                        {episodes.length > 0 && (
                            <div className="pt-4 sm:pt-6">
                                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                                    Episodes ({episodes.length})
                                </h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                                    {episodes.map((ep: any) => (
                                        <Link
                                            key={ep.id || ep.number}
                                            href={`/watch/${id}/${ep.id || ep.urlSlug}`}
                                            className="btn-outline text-center py-2 sm:py-3 text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                                        >
                                            Ep {ep.number}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <aside className="lg:w-[280px] space-y-4 sm:space-y-6">
                        {/* Sidebar Ad */}
                        <SidebarAd className="hidden lg:block" />

                        {/* Additional Info */}
                        <div className="glass-card p-4 space-y-3">
                            <h3 className="font-semibold text-sm sm:text-base">
                                Information
                            </h3>
                            <dl className="space-y-2 text-xs sm:text-sm">
                                {anime.type && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Type</dt>
                                        <dd>{anime.type}</dd>
                                    </div>
                                )}
                                {anime.status && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd>{anime.status}</dd>
                                    </div>
                                )}
                                {anime.season && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Season</dt>
                                        <dd>{anime.season}</dd>
                                    </div>
                                )}
                                {anime.studio && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Studio</dt>
                                        <dd>{anime.studio}</dd>
                                    </div>
                                )}
                                {episodes.length > 0 && (
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Episodes</dt>
                                        <dd>{episodes.length}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </aside>
                </div>
            </div>

            {/* YOU MAY ALSO LIKE SECTION - FIXED: PROPER CARD SIZING */}
            <section className="py-8 sm:py-12 md:py-16 bg-muted/30 mt-8 sm:mt-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {/* Section Header */}
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                            You May Also Like
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Similar anime recommendations
                        </p>
                    </div>

                    {/* RESPONSIVE GRID - MAXIMUM 12 CARDS, NEVER MORE THAN 6 COLUMNS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {relatedAnime.slice(0, 12).map((anime: any, index: number) => (
                            <AnimeCard
                                key={anime.id || anime.slug || anime.animeId || `related-${index}`}
                                id={anime.id || anime.slug || anime.animeId || ""}
                                slug={anime.slug}
                                title={anime.title}
                                image={anime.image || anime.poster || "/placeholder-anime.svg"}
                                episode={anime.episode}
                                rating={anime.rating}
                                type={anime.type}
                            />
                        ))}
                    </div>

                    {/* Browse More Button */}
                    <div className="mt-6 sm:mt-8 flex justify-center">
                        <Link
                            href="/browse"
                            className="btn-outline px-6 sm:px-8 py-2 sm:py-3"
                        >
                            Browse More Anime
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mobile Bottom Ad */}
            <div className="lg:hidden p-4">
                <SidebarAd className="w-full h-[100px]" />
            </div>
        </div>
    );
}
