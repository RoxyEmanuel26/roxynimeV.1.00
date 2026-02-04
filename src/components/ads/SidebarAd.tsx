import { cn } from "@/lib/utils";

interface SidebarAdProps {
    className?: string;
}

export function SidebarAd({ className }: SidebarAdProps) {
    return (
        <div
            className={cn(
                "ad-placeholder w-full lg:w-[300px] h-[250px] lg:h-[600px] my-4",
                className
            )}
        >
            <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-medium">Advertisement</span>
                <span className="text-[10px]">300x600 / 300x250</span>
            </div>
        </div>
    );
}
