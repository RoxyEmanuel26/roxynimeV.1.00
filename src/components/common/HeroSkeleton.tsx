import { cn } from "@/lib/utils";

interface HeroSkeletonProps {
    className?: string;
}

export function HeroSkeleton({ className }: HeroSkeletonProps) {
    return (
        <section className={cn("relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-muted skeleton", className)}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            <div className="relative h-full flex items-end">
                <div className="container mx-auto px-4 max-w-7xl pb-12">
                    <div className="max-w-2xl space-y-4">
                        <div className="space-y-2">
                            <div className="skeleton h-10 md:h-14 w-full rounded-md" />
                            <div className="skeleton h-10 md:h-14 w-5/6 rounded-md" />
                            <div className="skeleton h-10 md:h-14 w-4/6 rounded-md" />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <div className="skeleton h-10 w-32 rounded-md" />
                            <div className="skeleton h-10 w-32 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
