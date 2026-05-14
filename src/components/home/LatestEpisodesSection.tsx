"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Clock, Star, Eye, ChevronRight } from "lucide-react";
import { AdLink } from "@/components/ads/AdLink";
import type { Anime } from "./HeroSection";
import { getBlurDataURL } from "@/lib/utils";

interface LatestEpisodesSectionProps {
    animes: Anime[];
}

export function LatestEpisodesSection({ animes }: LatestEpisodesSectionProps) {
    if (!animes || animes.length === 0) return null;

    // Show first 6 items (3 rows x 2 cols)
    const displayAnimes = animes.slice(0, 6);

    return (
        <section className="py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* ═══ Header ═══ */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h2
                        className="text-2xl sm:text-3xl font-bold flex items-center gap-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        <Clock className="h-6 w-6 text-primary" />
                        Latest Episodes
                    </h2>

                    <Link
                        href="/ongoing"
                        className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                    >
                        View All
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* ═══ Grid — 2 cols desktop, 1 col mobile ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayAnimes.map((anime, index) => (
                        <LatestEpisodeCard
                            key={anime.id || anime.slug || `latest-${index}`}
                            anime={anime}
                            priority={index < 4}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════
   Individual Episode Card (Horizontal Layout)
   ═══════════════════════════════════════════ */
function LatestEpisodeCard({ anime, priority }: { anime: Anime; priority: boolean }) {
    const [imgSrc, setImgSrc] = useState(anime.image || '/placeholder-anime.svg');

    const animeId = anime.id || anime.slug || "";
    const slugLower = animeId.toLowerCase();
    const isEpisode = slugLower.match(/-episode-\d+/) ||
                      slugLower.match(/-eps-\d+/) ||
                      slugLower.match(/episode-\d+/) ||
                      slugLower.match(/eps-\d+/);
    const baseUrl = isEpisode ? `/watch/${animeId}` : `/anime/${animeId}`;
    const href = baseUrl;

    const ratingNum = typeof anime.rating === 'string' ? parseFloat(anime.rating) : anime.rating;
    const hasValidRating = ratingNum && !isNaN(ratingNum as number) && (ratingNum as number) > 0;

    // Parse episode display
    const episodeDisplay = (() => {
        if (!anime.episode) return null;
        const epStr = String(anime.episode);
        if (/^\d+$/.test(epStr)) return `Episode ${epStr}`;
        return epStr;
    })();

    // Status
    const statusLower = (anime.status || "").toLowerCase();
    const isOngoing = statusLower === "ongoing";
    const isCompleted = statusLower === "completed" || statusLower === "complete";

    return (
        <AdLink href={href} adKey={`ep-card-${animeId}`} className="block">
            <div className="latest-ep-card group">
                {/* Thumbnail */}
                <div className="relative w-[100px] sm:w-[120px] h-[64px] sm:h-[75px] rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                        src={imgSrc}
                        alt={anime.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="120px"
                        priority={priority}
                        loading={priority ? undefined : "lazy"}
                        placeholder="blur"
                        blurDataURL={getBlurDataURL(120, 75)}
                        onError={() => setImgSrc('/placeholder-anime.svg')}
                    />
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-white text-xs ml-0.5">▶</span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5">
                    {/* Title */}
                    <h3 className="font-semibold text-sm line-clamp-1 text-foreground group-hover:text-primary transition-colors mb-1">
                        {anime.title}
                    </h3>

                    {/* Episode Info */}
                    <div className="flex flex-col gap-1">
                        {episodeDisplay && (
                            <p className="text-xs text-muted-foreground">{episodeDisplay}</p>
                        )}
                    </div>

                    {/* Bottom Row: Status + Rating */}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {(isOngoing || isCompleted) && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${isCompleted ? 'badge-status-complete' : 'badge-status-ongoing'}`}>
                                {isCompleted ? "Complete" : "Ongoing"}
                            </span>
                        )}
                        {hasValidRating && (
                            <span className="text-[11px] text-amber-400 flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-current" />
                                {(ratingNum as number).toFixed(1)}
                            </span>
                        )}
                        {anime._source && (
                            <span className="text-[10px] text-white/25 ml-auto hidden sm:inline">
                                {anime._source}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </AdLink>
    );
}
