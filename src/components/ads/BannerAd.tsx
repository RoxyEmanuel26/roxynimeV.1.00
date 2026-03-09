"use client";

import { useEffect, useRef, useId } from "react";

interface BannerAdProps {
    adKey: string;
    width: number;
    height: number;
    className?: string;
}

/**
 * BannerAd — Reusable atOptions-based banner ad component.
 * Sets atOptions BEFORE loading invoke.js to satisfy Adsterra's requirement.
 * Each instance gets a unique wrapper via useId() to prevent conflicts.
 */
export function BannerAd({ adKey, width, height, className }: BannerAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const uniqueId = useId().replace(/:/g, "");

    useEffect(() => {
        if (loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        const container = containerRef.current;

        // FIXED: Step 1 — Set atOptions SEBELUM invoke.js dimuat
        const optionsScript = document.createElement("script");
        optionsScript.type = "text/javascript";
        optionsScript.text = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;
        container.appendChild(optionsScript);

        // FIXED: Step 2 — Load invoke.js SETELAH atOptions di-set
        const invokeScript = document.createElement("script");
        invokeScript.type = "text/javascript";
        invokeScript.src = `https://balkliving.com/${adKey}/invoke.js`;
        invokeScript.async = true;
        container.appendChild(invokeScript);
    }, [adKey, width, height]);

    return (
        <div
            ref={containerRef}
            id={`ad-banner-${uniqueId}`}
            className={`flex justify-center items-center overflow-hidden ${className || ""}`}
            style={{ minHeight: height }}
        />
    );
}
