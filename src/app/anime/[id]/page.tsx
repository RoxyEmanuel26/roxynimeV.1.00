import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, Calendar, Film, Heart, Share2, Clock } from "lucide-react";
import { BannerAd, SidebarAd } from "@/components/ads";
import { AnimeCarousel } from "@/components/anime";
import { getAnimeInfo, getOngoingAnimeList } from "@/lib/animbus";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const anime = await getAnimeInfo(id);

    if (!anime) {
        return {
            title: "Anime Not Found",
        };
    }

    return {
        title: anime.title,
        description: anime.description || `Watch ${anime.title} on RoxyNime`,
        openGraph: {
            title: anime.title,
            description: anime.description || `Watch ${anime.title} on RoxyNime`,
            images: anime.image ? [{ url: anime.image }] : [],
        },
    };
}

export default async function AnimeDetailPage({ params }: PageProps) {
    const { id } = await params;
    const [anime, relatedData] = await Promise.all([
        getAnimeInfo(id),
        getOngoingAnimeList(1),
    ]);

    if (!anime) {
        notFound();
    }

    // Parse episodes from the anime data
    const episodes = anime.episodes || [];
    const firstEpisode = episodes[0];

    return (
        <div className="min-h-screen">
            {/* Hero Banner */}
            <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover blur-sm scale-110"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 -mt-48 relative z-10">
                {/* Top Banner Ad */}
                <BannerAd className="mb-8" />

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Column */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            {/* Poster */}
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div className="relative w-[200px] md:w-[250px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                                    <Image
                                        src={anime.image}
                                        alt={anime.title}
                                        fill
                                        className="object-cover"
                                        priority
                                        unoptimized
                                    />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-4">
                                {/* Type Badge */}
                                <div className="flex flex-wrap gap-2">
                                    {anime.type && (
                                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                                            {anime.type}
                                        </span>
                                    )}
                                    {anime.status && (
                                        <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm">
                                            {anime.status}
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold">{anime.title}</h1>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {anime.rating && (
                                        <span className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            {anime.rating}
                                        </span>
                                    )}
                                    {anime.released && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {anime.released}
                                        </span>
                                    )}
                                    {anime.studio && (
                                        <span className="flex items-center gap-1">
                                            <Film className="h-4 w-4" />
                                            {anime.studio}
                                        </span>
                                    )}
                                    {episodes.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {episodes.length} Episodes
                                        </span>
                                    )}
                                </div>

                                {/* Genres */}
                                {anime.genres && anime.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {anime.genres.map((genre, index) => (
                                            <Link
                                                key={index}
                                                href={`/browse?genre=${encodeURIComponent(genre.toLowerCase())}`}
                                                className="genre-tag hover:bg-primary/20 transition-colors"
                                            >
                                                {genre}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Synopsis */}
                                {anime.synopsis && (
                                    <div className="glass-card p-4">
                                        <h3 className="font-semibold mb-2">Synopsis</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {anime.description}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    {firstEpisode && (
                                        <Link
                                            href={`/watch/${id}/${firstEpisode.number || "1"}`}
                                            className="btn-primary px-6"
                                        >
                                            <Play className="h-5 w-5 fill-current" />
                                            Watch Now
                                        </Link>
                                    )}
                                    <button className="btn-outline px-4">
                                        <Heart className="h-5 w-5" />
                                        Add to Favorites
                                    </button>
                                    <button className="btn-ghost px-4">
                                        <Share2 className="h-5 w-5" />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Episodes List */}
                        {episodes.length > 0 && (
                            <div className="glass-card p-6 mb-8">
                                <h2 className="text-xl font-bold mb-4">Episodes</h2>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                                    {episodes.map((episode) => (
                                        <Link
                                            key={episode.id}
                                            href={`/watch/${id}/${episode.number}`}
                                            className="flex items-center justify-center p-3 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                                        >
                                            {episode.number}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Banner Ad */}
                        <BannerAd className="mb-8" />

                        {/* Related Anime */}
                        <AnimeCarousel
                            title="You May Also Like"
                            subtitle="Similar anime recommendations"
                            animes={relatedData
                                .slice(0, 12)
                                .map((a) => ({
                                    ...a,
                                }))}
                        />
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:w-[300px] space-y-6">
                        <SidebarAd className="hidden lg:flex" />

                        {/* Anime Info Card */}
                        <div className="glass-card p-4">
                            <h3 className="font-semibold mb-4">Information</h3>
                            <dl className="space-y-3 text-sm">
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

            {/* Mobile Bottom Ad */}
            <div className="lg:hidden p-4 mt-8">
                <SidebarAd className="w-full h-[100px]" />
            </div>
        </div>
    );
}
