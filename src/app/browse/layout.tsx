import { Suspense } from "react";
import { AnimeGridSkeleton } from "@/components/common";

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
            <AnimeGridSkeleton count={18} />
        </div>
    );
}
