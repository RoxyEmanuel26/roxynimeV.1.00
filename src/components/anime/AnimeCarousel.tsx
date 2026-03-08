"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

interface Anime {
    id?: string;
    slug?: string;
    title: string;
    image: string;
    episode?: string | number;
    type?: string | string[];
}

interface AnimeCarouselProps {
    title: string;
    subtitle?: string;
    animes: Anime[];
    className?: string;
}

export function AnimeCarousel({
    title,
    subtitle,
    animes,
    className,
}: AnimeCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            setTimeout(checkScroll, 300);
        }
    };

    if (!animes || animes.length === 0) return null;

    return (
        <section className={cn("relative", className)}>
            {/* Header */}
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        className={cn(
                            "p-2 rounded-lg border border-border transition-all",
                            canScrollLeft
                                ? "hover:bg-muted cursor-pointer"
                                : "opacity-30 cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        className={cn(
                            "p-2 rounded-lg border border-border transition-all",
                            canScrollRight
                                ? "hover:bg-muted cursor-pointer"
                                : "opacity-30 cursor-not-allowed"
                        )}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Carousel */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4"
            >
                {animes.map((anime, index) => (
                    <div
                        key={anime.id || anime.title + index}
                        className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px]"
                    >
                        <AnimeCard
                            id={anime.id || ""}
                            slug={anime.slug}
                            title={anime.title}
                            image={anime.image}
                            episode={anime.episode}
                            type={anime.type}
                            priority={index < 4}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
