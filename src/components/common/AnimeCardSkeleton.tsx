import { cn } from "@/lib/utils";

interface AnimeCardSkeletonProps {
    className?: string;
}

export function AnimeCardSkeleton({ className }: AnimeCardSkeletonProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="skeleton aspect-[3/4] rounded-xl w-full" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
        </div>
    );
}
