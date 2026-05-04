"use client";

import { useCallback } from "react";
import { getRandomAdLink } from "@/config/adLinks";

/**
 * useAdClick — Background Ad Open Hook
 *
 * On FIRST click: opens a random ad link in a new tab (background).
 *                 Navigation is NOT blocked — user goes to destination immediately.
 * On subsequent clicks: no ad is opened.
 *
 * Uses a per-element key stored in sessionStorage so each unique button
 * only shows the ad ONCE per session.
 *
 * @param elementKey — unique identifier for this clickable element
 * @returns { interceptClick } — call on click to open ad if not yet shown
 */
export function useAdClick(elementKey: string) {
    const storageKey = `adclicked_${elementKey}`;

    const hasClicked = useCallback((): boolean => {
        if (typeof window === "undefined") return false;
        return sessionStorage.getItem(storageKey) === "1";
    }, [storageKey]);

    const markClicked = useCallback(() => {
        if (typeof window === "undefined") return;
        sessionStorage.setItem(storageKey, "1");
    }, [storageKey]);

    /**
     * interceptClick — call this in your onClick handler.
     * Opens an ad in a new tab if not yet shown for this element.
     * Does NOT block navigation — the destination loads simultaneously.
     */
    const interceptClick = useCallback((): void => {
        if (hasClicked()) {
            // Already showed ad for this element, do nothing
            return;
        }

        // Open ad in new tab (background) and mark as shown
        const adUrl = getRandomAdLink();
        window.open(adUrl, "_blank", "noopener,noreferrer");
        markClicked();
    }, [hasClicked, markClicked]);

    return { interceptClick, hasClicked };
}

