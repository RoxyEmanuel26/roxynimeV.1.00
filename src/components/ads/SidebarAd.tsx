"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getEnabledSidebarAds } from "@/config/ads.config";

interface SidebarAdProps {
    className?: string;
}

export function SidebarAd({ className }: SidebarAdProps) {
    const loadedRefs = useRef<{ [key: string]: boolean }>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const ads = getEnabledSidebarAds();

    useEffect(() => {
        if (!containerRef.current || ads.length === 0) return;

        ads.forEach((ad) => {
            if (loadedRefs.current[ad.id]) return;

            // Cari element ins yang baru saja di-render untuk iklan ini
            const insElement = containerRef.current?.querySelector(`ins.${ad.insProps.className}`);
            if (!insElement) return;

            loadedRefs.current[ad.id] = true;

            const script = document.createElement("script");
            script.src = ad.scriptSrc;
            script.async = true;
            insElement.appendChild(script);
        });
    }, [ads]);

    if (ads.length === 0) return null;

    return (
        <div ref={containerRef} className={cn("hidden md:flex flex-col items-center gap-4", className)}>
            {ads.map((ad) => (
                <div key={ad.id} className="w-full flex justify-center">
                    <ins {...ad.insProps} />
                </div>
            ))}
        </div>
    );
}
