"use client";

import { useEffect, useRef } from "react";

interface BannerAdProps {
    adKey: string;
    width: number;
    height: number;
    className?: string;
}

/**
 * BannerAd — Reusable Adsterra banner ad component.
 * 
 * How Adsterra works:
 * 1. Set window.atOptions with the ad config
 * 2. Load invoke.js which reads window.atOptions and creates the iframe
 * 3. The iframe is inserted as a sibling/child near the script
 * 
 * Problem with multiple ads: window.atOptions is a global that gets overwritten.
 * Solution: Use inline script to set atOptions immediately before invoke.js loads,
 * ensuring each ad gets the correct config via sequential script execution.
 */
export function BannerAd({ adKey, width, height, className }: BannerAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;
        if (!containerRef.current) return;

        loadedRef.current = true;

        const container = containerRef.current;

        // Clear any stale content (React Strict Mode / re-mount)
        container.innerHTML = "";

        // Inline config script — executes synchronously before invoke.js
        const configScript = document.createElement("script");
        configScript.textContent = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;

        // Invoke script — loads async but reads atOptions set above
        const invokeScript = document.createElement("script");
        invokeScript.type = "text/javascript";
        invokeScript.src = `https://glamournakedemployee.com/${adKey}/invoke.js`;

        // Append config FIRST, then invoke — browser guarantees sequential execution
        container.appendChild(configScript);
        container.appendChild(invokeScript);

        return () => {
            // Cleanup
            container.innerHTML = "";
            loadedRef.current = false;
        };
    }, [adKey, width, height]);

    return (
        <div className={`flex justify-center items-center w-full overflow-hidden ${className || ""}`}>
            <div
                ref={containerRef}
                className="flex justify-center items-center"
                style={{ minHeight: `${height}px`, minWidth: `${Math.min(width, 320)}px` }}
            />
        </div>
    );
}
