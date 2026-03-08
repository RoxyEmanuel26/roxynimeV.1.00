import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

interface Anime {
    id?: string;
    slug?: string;
    title: string;
    image: string;
    episode?: string | number;
    type?: string | string[];
    rating?: number;
}

interface AnimeGridProps {
    animes: Anime[];
    className?: string;
    loading?: boolean;
}

import { AnimeCardSkeleton } from "@/components/common";

export function AnimeGrid({ animes, className, loading }: AnimeGridProps) {
    if (loading) {
        return (
            <div
                className={cn(
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
                    className
                )}
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <AnimeCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }

    if (!animes || animes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No anime found</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6",
                className
            )}
        >
            {animes.map((anime, index) => (
                <AnimeCard
                    key={anime.id || anime.slug || `anime-${index}-${anime.title.substring(0, 10)}`}
                    id={anime.id || anime.slug || `anime-${index}`}
                    slug={anime.slug}
                    title={anime.title}
                    image={anime.image}
                    episode={anime.episode}
                    type={anime.type}
                    rating={anime.rating}
                    priority={index < 6}
                />
            ))}
        </div>
    );
}
