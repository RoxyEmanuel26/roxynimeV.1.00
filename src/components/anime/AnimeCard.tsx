"use client";

import Image from "next/image";
import { AdLink } from "@/components/ads/AdLink";
import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Play, Clock } from "lucide-react";
import { cn, getBlurDataURL } from "@/lib/utils";
import { useDataSaver } from "@/context/DataSaverContext";
import Link from "next/link";

interface AnimeCardProps {
    id: string;
    slug?: string;
    title: string;
    image: string;
    episode?: string | number;
    rating?: number | string;
    type?: string | string[];
    source?: string;
    className?: string;
    priority?: boolean;
    status?: string;
    description?: string;
    genres?: string[];
    updatedAt?: string;
}

export function AnimeCard({
    id,
    slug,
    title,
    image,
    episode,
    rating,
    type,
    source,
    className,
    priority = false,
    status,
    description,
    genres,
    updatedAt,
}: AnimeCardProps) {
    const animeId = id || (slug?.match(/\/anime\/(\d+)/)?.[1]) || slug || "";
    const slugLower = animeId.toLowerCase();
    const isEpisode = slugLower.match(/-episode-\d+/) ||
                      slugLower.match(/-eps-\d+/) ||
                      slugLower.match(/episode-\d+/) ||
                      slugLower.match(/eps-\d+/);

    const baseUrl = isEpisode ? `/watch/${animeId}` : `/anime/${animeId}`;
    const href = source ? `${baseUrl}?source=${source}` : baseUrl;

    const [imgSrc, setImgSrc] = useState(image || '/placeholder-anime.svg');
    const { isHemat, addSavedBytes } = useDataSaver();
    const [showPopover, setShowPopover] = useState(false);
    const [popoverSide, setPopoverSide] = useState<'right' | 'left'>('right');
    const cardRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Catat penghematan saat mode hemat (tiap card ~50KB gambar)
    useEffect(() => {
        if (isHemat) {
            addSavedBytes(51200);
        }
    }, [isHemat, addSavedBytes]);

    const ratingNum = typeof rating === 'string' ? parseFloat(rating) : rating;
    const hasValidRating = ratingNum && !isNaN(ratingNum) && ratingNum > 0;

    // Determine status badge
    const statusLower = status?.toLowerCase() || "";
    const isOngoing = statusLower === "ongoing";
    const isCompleted = statusLower === "completed" || statusLower === "complete";
    const showStatusBadge = isOngoing || isCompleted;

    // Format episode display
    const episodeDisplay = (() => {
        if (!episode) return null;
        const epStr = String(episode);
        if (/^\d+$/.test(epStr)) return `Eps. ${epStr}`;
        if (epStr.toLowerCase().startsWith("eps")) return epStr;
        return epStr;
    })();

    const handleMouseEnter = useCallback(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setPopoverSide(rect.right > window.innerWidth * 0.65 ? 'left' : 'right');
        }
        hoverTimeoutRef.current = setTimeout(() => setShowPopover(true), 500);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setShowPopover(false);
    }, []);

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    // Render card versi ultra ringan saat mode hemat:
    if (isHemat) {
        return (
            <Link href={href}
                className="flex items-center gap-3 p-3
        bg-gray-900/50 border border-white/8
        rounded-xl hover:border-white/15
        transition-colors duration-150"
            >
                <div className="w-10 h-14 rounded-lg bg-white/5
        flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎬</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">
                        {title}
                    </p>
                    {episode && (
                        <p className="text-xs text-cyan-400/70 mt-0.5">{episodeDisplay}</p>
                    )}
                    {type && (
                        <p className="text-[10px] text-white/30 mt-0.5">
                            {Array.isArray(type) ? type.join(" · ") : type}
                        </p>
                    )}
                </div>
            </Link>
        );
    }

    const hasPopoverContent = description || (genres && genres.length > 0);

    return (
        <div
            ref={cardRef}
            className={cn("group relative fade-in", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <AdLink href={href} adKey={`card-${animeId}`} className="block">
                <div className="anime-card aspect-[3/4] relative">
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        priority={priority}
                        loading={priority ? undefined : "lazy"}
                        placeholder="blur"
                        blurDataURL={getBlurDataURL(300, 420)}
                        onError={() => setImgSrc('/placeholder-anime.svg')}
                    />

                    {/* Bottom gradient overlay (always visible) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-[5]" />

                    {/* Rating Badge — Top Left */}
                    {hasValidRating && (
                        <div className="absolute top-2 left-2 z-20 badge-rating">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            <span>{ratingNum!.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Status Badge — Top Right */}
                    {showStatusBadge && (
                        <div className={`absolute top-2 right-2 z-20 ${isCompleted ? 'badge-status-complete' : 'badge-status-ongoing'}`}>
                            {isCompleted ? "COMPLETE" : "ONGOING"}
                        </div>
                    )}

                    {/* Episode Badge — Bottom Center */}
                    {episodeDisplay && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 badge-episode">
                            {episodeDisplay}
                        </div>
                    )}

                    {/* Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="mt-2 font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>

                {/* Date / Source Indicator */}
                {updatedAt && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{updatedAt}</span>
                    </div>
                )}
            </AdLink>

            {/* ═══ Hover Info Popover — Desktop Only (Pure CSS) ═══ */}
            {hasPopoverContent && (
                <div
                    className={cn(
                        "anime-popover hidden lg:block transition-all duration-200 ease-out",
                        popoverSide === 'right' ? 'left-[calc(100%+12px)]' : 'right-[calc(100%+12px)]',
                        showPopover ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 pointer-events-none',
                        popoverSide === 'right' && !showPopover && '-translate-x-2',
                        popoverSide === 'left' && !showPopover && 'translate-x-2',
                    )}
                >
                    {/* Popover Title */}
                    <h4 className="font-bold text-sm text-white mb-2 line-clamp-2 font-heading">
                        {title}
                    </h4>

                    {/* Status + Rating row */}
                    <div className="flex items-center gap-2 mb-3">
                        {showStatusBadge && (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${isCompleted ? 'badge-status-complete' : 'badge-status-ongoing'}`}>
                                {isCompleted ? "Complete" : "Ongoing"}
                            </span>
                        )}
                        {hasValidRating && (
                            <span className="text-[11px] text-amber-400 flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-current" />
                                {ratingNum!.toFixed(1)}
                            </span>
                        )}
                        {episodeDisplay && (
                            <span className="text-[11px] text-white/40">{episodeDisplay}</span>
                        )}
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-xs text-white/55 line-clamp-4 leading-relaxed mb-2">
                            {description}
                        </p>
                    )}

                    {/* Genre Tags */}
                    {genres && genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/5">
                            {genres.slice(0, 4).map((g, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/45">
                                    {g}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
