import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return <div className={cn("skeleton", className)} />;
}



export function AnimeDetailSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="w-full md:w-[300px] aspect-[3/4] rounded-xl" />
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded" />
                    <Skeleton className="h-10 w-40 rounded" />
                </div>
            </div>
            <Skeleton className="h-6 w-48 rounded" />
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {Array.from({ length: 24 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 rounded" />
                ))}
            </div>
        </div>
    );
}

export function VideoPlayerSkeleton() {
    return (
        <Skeleton className="aspect-video rounded-xl" />
    );
}
