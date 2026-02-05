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
        // Pastikan script hanya dimuat sekali per instance
        if (isScriptLoaded.current || !containerRef.current) return;

        try {
            // Set atOptions ke window object
            // @ts-ignore
            window.atOptions = {
                key: "1d4f1463e95b8d3fb84adadeb3a2f170",
                format: "iframe",
                height: 90,
                width: 728,
                params: {}
            };

            // Buat dan inject script Adsterra
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://www.highperformanceformat.com/1d4f1463e95b8d3fb84adadeb3a2f170/invoke.js";
            script.async = true;

            // Append script ke container
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
                className="hidden lg:flex justify-center items-center min-h-[90px] bg-gray-800/30 rounded-lg"
                id={`adsterra-banner-${uniqueId}`}
            >
                {/* Fallback content jika iklan tidak load */}
                <span className="text-xs text-gray-500">Advertisement 728x90</span>
            </div>

            {/* Mobile Banner - Visible placeholder */}
            <div className="lg:hidden flex justify-center items-center min-h-[50px] bg-gray-800/30 rounded-lg border border-gray-700/50">
                <span className="text-xs text-gray-400">Advertisement 320x50</span>
            </div>
        </div>
    );
}
