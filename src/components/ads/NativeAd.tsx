"use client";

import { useEffect, useRef } from "react";
import { getNativeAdBySet } from "@/config/ads.config";

interface NativeAdProps {
    /** "A" untuk Set A, "B" untuk Set B */
    set?: "A" | "B";
    className?: string;
}

/**
 * NativeAd — Native banner ad component.
 * Script URLs & container IDs dikonfigurasi di src/config/ads.config.ts
 */
export function NativeAd({ set = "A", className }: NativeAdProps) {
    const loadedRef = useRef(false);
    const ad = getNativeAdBySet(set);

    useEffect(() => {
        if (loadedRef.current || !ad) return;

        const container = document.getElementById(ad.containerId);
        if (!container) return;

        loadedRef.current = true;

        const script = document.createElement("script");
        script.src = ad.src;
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        container.appendChild(script);
    }, [ad]);

    if (!ad) return null;

    return (
        <div className={`w-full ${className || ""}`}>
            <div id={ad.containerId} />
        </div>
    );
}
