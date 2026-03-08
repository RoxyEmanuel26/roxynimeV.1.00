"use client";

import { useEffect, useRef } from "react";
import { getPopunderScripts } from "@/config/ads.config";

/**
 * PopunderAd — Injects popunder scripts from all enabled networks.
 */
export function PopunderAd() {
    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) return;

        const scripts = getPopunderScripts();
        if (scripts.length === 0) return;

        try {
            scripts.forEach((scriptUrl) => {
                const script = document.createElement("script");
                script.src = scriptUrl;
                script.async = true;
                document.body.appendChild(script);
            });

            isLoaded.current = true;
            console.log(`[Ads] ${scripts.length} popunder script(s) injected`);
        } catch (error) {
            console.error("[Ads] Error loading popunder:", error);
        }
    }, []);

    return null;
}
