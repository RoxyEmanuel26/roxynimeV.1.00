"use client";

import { useEffect, useRef, useId } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
    className?: string;
}

export function BannerAd({ className }: BannerAdProps) {
    const uniqueId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const isScriptLoaded = useRef(false);

    useEffect(() => {
        if (isScriptLoaded.current || !containerRef.current) return;

        try {
            // @ts-ignore
            window.atOptions = {
                key: "1d4f1463e95b8d3fb84adadeb3a2f170",
                format: "iframe",
                height: 90,
                width: 728,
                params: {}
            };

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://www.highperformanceformat.com/1d4f1463e95b8d3fb84adadeb3a2f170/invoke.js";
            script.async = true;
            containerRef.current.appendChild(script);
            isScriptLoaded.current = true;
        } catch (error) {
            console.error("Error loading Adsterra banner:", error);
        }
    }, []);

    return (
        <div className={cn("w-full max-w-[728px] mx-auto my-2", className)}>
            {/* Desktop Banner 728x90 */}
            <div
                ref={containerRef}
                className="hidden lg:flex justify-center items-center min-h-[90px]"
                id={`adsterra-banner-${uniqueId}`}
            />

            {/* Mobile Banner - Create separate unit in Adsterra for 320x50 */}
            <div className="lg:hidden flex justify-center items-center min-h-[50px] bg-gray-800/30 rounded-lg" />
        </div>
    );
}
