import { AnimeDetailSkeleton } from "@/components/common";

export default function AnimeLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <AnimeDetailSkeleton />
        </div>
    );
}
