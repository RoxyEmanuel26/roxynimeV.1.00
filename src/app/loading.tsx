import { HeroSkeleton, AnimeCardSkeleton } from "@/components/common";

export default function Loading() {
    return (
        <div className="min-h-screen pointer-events-none">
            {/* Hero Skeleton */}
            <HeroSkeleton />

            <div className="skeleton h-[90px] w-full max-w-[728px] mx-auto my-6 rounded" />

            {/* Trending Section Skeleton */}
            <section className="py-8 sm:py-12 md:py-16 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="mb-6 sm:mb-8">
                        <div className="skeleton h-8 rounded w-48 mb-2" />
                        <div className="skeleton h-4 rounded w-64" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
