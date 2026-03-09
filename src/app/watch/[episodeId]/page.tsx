import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sankaClient } from "@/lib/sankaClient";
import { ChevronLeft, ChevronRight, Home, Info, Film } from "lucide-react";
import WatchPlayer from "./WatchPlayer";
import { BannerAd, PopunderAd, StickyMobileAd } from "@/components/ads";

interface PageProps {
    params: Promise<{ episodeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { episodeId } = await params;

    // Try to create a readable title from episodeId (e.g., ramen-akaneko-episode-3-sub-indo)
    const readableName = episodeId
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    return {
        title: `Nonton ${readableName} — RoxyNime`,
        description: `Streaming ${readableName} subtitle Indonesia gratis dan cepat di RoxyNime.`,
    };
}

export default async function WatchPage({ params }: PageProps) {
    const { episodeId } = await params;

    // Fetch streaming links
    const servers = await sankaClient.getStreams(episodeId);

    // Attempt to guess anime slug to fetch details for Prev/Next navigation
    // e.g. "ramen-akaneko-episode-3-sub-indo" -> "ramen-akaneko"
    const guessSlug = episodeId.replace(/-episode-\d+.*$/i, "");

    let anime = null;
    let prevEp = null;
    let nextEp = null;
    let currentEpNumber: string | null = null;

    // Extract current episode number from slug
    const epMatch = episodeId.match(/-episode-(\d+)/i);
    if (epMatch) {
        currentEpNumber = epMatch[1];
    }

    try {
        if (guessSlug && guessSlug !== episodeId) {
            anime = await sankaClient.getDetail(guessSlug);

            if (anime && anime.episodes && currentEpNumber) {
                const currentEpNum = parseInt(currentEpNumber, 10);

                // Find prev/next in episodes array
                // Sanka episodes are usually sorted descending (latest first)
                const currentIdx = anime.episodes.findIndex(ep => ep.number === currentEpNum);

                if (currentIdx !== -1) {
                    // Since array is descending (e.g., 3, 2, 1):
                    // Previous episode is index + 1
                    // Next episode is index - 1
                    if (currentIdx + 1 < anime.episodes.length) {
                        prevEp = anime.episodes[currentIdx + 1];
                    }
                    if (currentIdx - 1 >= 0) {
                        nextEp = anime.episodes[currentIdx - 1];
                    }
                }
            }
        }
    } catch (error) {
        console.error("Failed to fetch anime details for prev/next:", error);
        // Ignore error, we just won't show prev/next buttons
    }

    // Fallback title formatting
    const formattedTitle = episodeId
        .replace(/-sub-indo$/i, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="min-h-screen pb-12 bg-background">
            <PopunderAd />
            <StickyMobileAd />

            {/* Breadcrumb / Top Bar */}
            <div className="bg-card w-full border-b border-border sticky top-0 z-30 shadow-sm">
                <div className="container mx-auto px-4 max-w-7xl h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hide text-sm sm:text-base font-semibold truncate pr-4">
                        <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Link
                            href={anime ? `/anime/${anime.slug}` : "/browse"}
                            className="text-muted-foreground hover:text-primary transition-colors truncate"
                            title={anime?.title || "Anime"}
                        >
                            {anime?.title || "Anime"}
                        </Link>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground truncate">Episode {currentEpNumber || "?"}</span>
                    </div>

                    {anime && (
                        <Link
                            href={`/anime/${anime.slug}`}
                            className="shrink-0 flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-colors"
                        >
                            <Info className="w-4 h-4" />
                            <span className="hidden sm:inline">Detail</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 pt-6 max-w-5xl">
                <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90} className="mb-6 hidden md:flex" />

                {/* Title Area */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                        {anime ? `Nonton ${anime.title} Episode ${currentEpNumber || "?"} Sub Indo` : formattedTitle}
                    </h1>
                    {anime?.synopsis && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 max-w-3xl">
                            {anime.synopsis}
                        </p>
                    )}
                </div>

                {/* Video Player Component (Client) */}
                <WatchPlayer servers={servers} />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 mt-8 bg-card p-4 rounded-xl border border-border shadow-sm">
                    {prevEp ? (
                        <Link
                            href={`/watch/${prevEp.urlSlug}`}
                            className="flex-1 flex items-center justify-center sm:justify-start gap-2 sm:gap-4 px-4 py-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground rounded-lg transition-all font-medium group"
                        >
                            <ChevronLeft className="w-5 h-5 shrink-0" />
                            <div className="hidden sm:block text-left">
                                <div className="text-xs opacity-70 mb-0.5">Sebelumnya</div>
                                <div className="truncate">Episode {prevEp.number}</div>
                            </div>
                            <span className="sm:hidden">Prev Eps</span>
                        </Link>
                    ) : (
                        <div className="flex-1 px-4 py-3 bg-muted/50 text-muted-foreground rounded-lg flex items-center justify-center sm:justify-start gap-2 sm:gap-4 cursor-not-allowed opacity-50">
                            <ChevronLeft className="w-5 h-5" />
                            <div className="hidden sm:block text-left">
                                <div className="text-xs mb-0.5">Sebelumnya</div>
                                <div>Tidak ada</div>
                            </div>
                            <span className="sm:hidden">Prev Eps</span>
                        </div>
                    )}

                    <Link
                        href={anime ? `/anime/${anime.slug}` : "/browse"}
                        className="shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground rounded-full transition-all group"
                        title="Daftar Episode"
                    >
                        <Film className="w-5 h-5" />
                    </Link>

                    {nextEp ? (
                        <Link
                            href={`/watch/${nextEp.urlSlug}`}
                            className="flex-1 flex items-center justify-center sm:justify-end gap-2 sm:gap-4 px-4 py-3 bg-muted hover:bg-primary hover:text-primary-foreground text-foreground rounded-lg transition-all font-medium group text-right"
                        >
                            <div className="hidden sm:block text-right">
                                <div className="text-xs opacity-70 mb-0.5">Selanjutnya</div>
                                <div className="truncate">Episode {nextEp.number}</div>
                            </div>
                            <span className="sm:hidden">Next Eps</span>
                            <ChevronRight className="w-5 h-5 shrink-0" />
                        </Link>
                    ) : (
                        <div className="flex-1 px-4 py-3 bg-muted/50 text-muted-foreground rounded-lg flex items-center justify-center sm:justify-end gap-2 sm:gap-4 cursor-not-allowed opacity-50 text-right">
                            <div className="hidden sm:block text-right">
                                <div className="text-xs mb-0.5">Selanjutnya</div>
                                <div>Tidak ada</div>
                            </div>
                            <span className="sm:hidden">Next Eps</span>
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <BannerAd adKey="dd5f08b2cef41d33b6c75282914cefd4" width={468} height={60} className="mt-8 hidden sm:flex" />
            </div>
        </div>
    );
}
