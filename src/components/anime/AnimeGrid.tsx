import { AnimeCard } from "./AnimeCard";
import { cn } from "@/lib/utils";

interface Anime {
    id?: string;
    slug: string;
    title: string;
    image: string;
    episode?: string;
    type?: string[];
    rating?: number;
}

interface AnimeGridProps {
    animes: Anime[];
    className?: string;
    loading?: boolean;
}

export function AnimeGrid({ animes, className, loading }: AnimeGridProps) {
    if (loading) {
        return (
            <div
                className={cn(
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
                    className
                )}
            >
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="skeleton aspect-[3/4] rounded-xl" />
                        <div className="skeleton h-4 w-3/4 rounded" />
                    </div>
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
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
                className
            )}
        >
            {animes.map((anime, index) => (
                <AnimeCard
                    key={anime.slug + index}
                    id={anime.id || ""}
                    slug={anime.slug}
                    title={anime.title}
                    image={anime.image}
                    episode={anime.episode}
                    type={anime.type}
                    rating={anime.rating}
                />
            ))}
        </div>
    );
}
