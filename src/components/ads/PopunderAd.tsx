"use client";

import { useEffect, useRef } from "react";

/**
 * PopunderAd
 * Injects the ad network script that handles frequency capping and popunder logic.
 */
export function PopunderAd() {
    const isLoaded = useRef(false);

    useEffect(() => {
        if (isLoaded.current) return;

        try {
            const script = document.createElement("script");
            // Script from user: https://pl28650799.effectivegatecpm.com/a2/92/18/a29218ac83917d59f19c700bc4e955f0.js
            script.src = "//pl28650799.effectivegatecpm.com/a2/92/18/a29218ac83917d59f19c700bc4e955f0.js";
            script.async = true;
            document.body.appendChild(script);

            isLoaded.current = true;

            // Debug
            console.log("Popunder script injected");
        } catch (error) {
            console.error("Error loading popunder:", error);
        }
    }, []);

    return null;
}
