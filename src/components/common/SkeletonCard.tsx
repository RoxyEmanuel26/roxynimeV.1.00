export function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[2/3] bg-muted rounded-lg mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
    );
}

interface AnimeGridSkeletonProps {
    count?: number;
}

export function AnimeGridSkeleton({ count = 20 }: AnimeGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
            ))}
        </div>
    );
}
