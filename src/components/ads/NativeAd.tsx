"use client";

import { useEffect, useRef } from "react";

interface NativeAdProps {
    /** "A" untuk Set A, "B" untuk Set B */
    set?: "A" | "B";
    className?: string;
}

// FIXED: Data native banner per set dari balkliving.com
const NATIVE_ADS = {
    A: {
        src: "https://balkliving.com/1fe522e35341470390c5d22d3859e155/invoke.js",
        containerId: "container-1fe522e35341470390c5d22d3859e155",
    },
    B: {
        src: "https://balkliving.com/eb9a01b55acbcef04f866e53d4339f0e/invoke.js",
        containerId: "container-eb9a01b55acbcef04f866e53d4339f0e",
    },
} as const;

/**
 * NativeAd — Native banner ad dari Adsterra via balkliving.com.
 * Menggunakan container ID unik dan invoke.js per set.
 */
export function NativeAd({ set = "A", className }: NativeAdProps) {
    const loadedRef = useRef(false);
    const ad = NATIVE_ADS[set];

    useEffect(() => {
        if (loadedRef.current) return;

        // Cek apakah container sudah ada di DOM
        const container = document.getElementById(ad.containerId);
        if (!container) return;

        loadedRef.current = true;

        const script = document.createElement("script");
        script.src = ad.src;
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        container.appendChild(script);
    }, [ad]);

    return (
        <div className={`w-full ${className || ""}`}>
            <div id={ad.containerId} />
        </div>
    );
}
