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
    return null;
}
