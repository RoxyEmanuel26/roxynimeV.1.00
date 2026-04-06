"use client";

import { useCallback, useRef } from "react";
import { getRandomAdLink } from "@/config/adLinks";

/**
 * useAdClick — Two-Click Redirect Hook
 *
 * On FIRST click: opens a random ad link in a new tab, blocks navigation.
 * On SECOND click: allows normal navigation.
 *
 * Uses a per-element key stored in sessionStorage so each unique button
 * only shows the ad ONCE per session.
 *
 * @param elementKey — unique identifier for this clickable element
 * @returns { interceptClick } — wraps your onClick handler
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
     * interceptClick — call this BEFORE your real navigation.
     * Returns `true` if the ad was shown (meaning: block navigation).
     * Returns `false` if user already saw the ad (meaning: allow navigation).
     */
    const interceptClick = useCallback((): boolean => {
        if (hasClicked()) {
            // Already showed ad for this element, allow normal action
            return false;
        }

        // First click — open ad and block navigation
        const adUrl = getRandomAdLink();
        window.open(adUrl, "_blank", "noopener,noreferrer");
        markClicked();
        return true; // signal: ad was shown, block navigation
    }, [hasClicked, markClicked]);

    return { interceptClick, hasClicked };
}
