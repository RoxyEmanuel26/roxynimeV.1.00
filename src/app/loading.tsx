import { AnimeCardSkeleton } from "@/components/common";

export default function Loading() {
    return (
        <div className="min-h-screen pointer-events-none">
            {/* Top Ad Skeleton */}
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="skeleton h-[90px] w-full max-w-[728px] mx-auto my-4 rounded hidden md:block" />
            </div>

            {/* Trending Section Skeleton */}
            <section className="pt-6 pb-8 sm:pt-8 sm:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {/* Title + Filter Tabs */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div className="skeleton h-9 rounded w-56" />
                        <div className="flex gap-2">
                            <div className="skeleton h-8 w-16 rounded-full" />
                            <div className="skeleton h-8 w-20 rounded-full" />
                            <div className="skeleton h-8 w-22 rounded-full" />
                            <div className="skeleton h-8 w-16 rounded-full" />
                        </div>
                    </div>

                    {/* Grid 5 cols */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <AnimeCardSkeleton key={i} />
                        ))}
                    </div>

                    {/* Series Terbaru button */}
                    <div className="mt-8 flex justify-center">
                        <div className="skeleton h-10 w-40 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Latest Episodes Skeleton */}
            <section className="py-8 sm:py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="skeleton h-9 rounded w-48" />
                        <div className="skeleton h-5 rounded w-20" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                <div className="skeleton w-[120px] h-[75px] rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="skeleton h-4 rounded w-3/4" />
                                    <div className="skeleton h-3 rounded w-1/3" />
                                    <div className="skeleton h-3 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
