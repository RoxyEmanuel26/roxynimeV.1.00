import { Suspense } from "react";
import { AnimeCardSkeleton } from "@/components/common";

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<BrowseLoading />}>
            {children}
        </Suspense>
    );
}

function BrowseLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="skeleton h-8 w-48 mb-2 rounded" />
                <div className="skeleton h-4 w-72 rounded" />
            </div>
            <div className="skeleton h-12 w-full mb-8 rounded-lg" />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {Array.from({ length: 20 }).map((_, i) => (
                    <AnimeCardSkeleton key={`skeleton-${i}`} />
                ))}
            </div>
        </div>
    );
}
