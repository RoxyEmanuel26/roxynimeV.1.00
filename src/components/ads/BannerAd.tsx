import { cn } from "@/lib/utils";

interface BannerAdProps {
    className?: string;
}

export function BannerAd({ className }: BannerAdProps) {
    return (
        <div
            className={cn(
                "ad-placeholder h-[50px] lg:h-[90px] w-full max-w-[728px] mx-auto my-2",
                className
            )}
        >
            <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-medium">Advertisement</span>
                <span className="text-[10px]">728x90 / 320x50</span>
            </div>
        </div>
    );
}
