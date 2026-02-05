"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
    className?: string;
    position?: "left" | "right";
}

export function SidebarAd({ className, position = "right" }: SidebarAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScriptLoaded = useRef(false);

    useEffect(() => {
        if (isScriptLoaded.current || !containerRef.current) return;

        try {
            // @ts-ignore
            window.atOptionsSidebar = {
                key: "d558679ec97b5a1d31760db5c4fbfb64",
                format: "iframe",
                height: 600,
                width: 160,
                params: {}
            };

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://www.highperformanceformat.com/d558679ec97b5a1d31760db5c4fbfb64/invoke.js";
            script.async = true;
            containerRef.current.appendChild(script);
            isScriptLoaded.current = true;
        } catch (error) {
            console.error("Error loading Adsterra sidebar ad:", error);
        }
    }, []);

    return (
        <aside
            className={cn(
                "hidden xl:block",
                "w-[160px] min-h-[600px]",
                position === "left" ? "mr-6" : "ml-6",
                className
            )}
            aria-label={`${position} sidebar advertisement`}
        >
            <div
                ref={containerRef}
                className="sticky top-20 w-[160px] min-h-[600px]"
                id={`adsterra-sidebar-${position}`}
            />
        </aside>
    );
}
