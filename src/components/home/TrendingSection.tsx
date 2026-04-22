import Link from "next/link";
import { AnimeCard } from "@/components/anime";
import { NativeAd } from "@/components/ads";
import type { Anime } from "./HeroSection";

export function TrendingSection({ animes }: { animes: Anime[] }) {
    if (!animes || animes.length === 0) return null;

    return (
        <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                        🔥 Trending Now
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Anime populer dari semua sumber
                    </p>
                </div>

                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-5 lg:gap-6 md:overflow-visible">
                    {animes.slice(0, 18).map((anime, index) => (
                        <div key={anime.id || anime.slug || `home-${index}`} className="flex-none w-[140px] sm:w-[160px] md:w-auto snap-start">
                            <AnimeCard
                                id={anime.id || anime.slug || ""}
                                slug={anime.slug}
                                title={anime.title}
                                image={anime.image}
                                episode={anime.episode}
                                rating={anime.rating}
                                type={anime.type}
                                priority={index < 6}
                            />
                        </div>
                    ))}
                </div>

                <NativeAd set="A" className="mt-4" />

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
    );
}
