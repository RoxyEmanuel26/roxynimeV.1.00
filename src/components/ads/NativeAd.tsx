"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface NativeAdProps {
    className?: string;
    slot?: string;
}

/**
 * NativeAd — Small 320x50 ad that blends with content.
 * Picks from enabled networks' native ads, falls back to banners.
 */
export function NativeAd({ className, slot = "native" }: NativeAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("native", slot);
    if (!ad) return null;

    return (
        <div className={cn("w-full flex justify-center my-2 px-4", className)}>
            <iframe
                title={`ad-native-${slot}`}
                srcDoc={generateAdSrcDoc(ad, 320, 50)}
                width={320}
                height={50}
                style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                scrolling="no"
            />
        </div>
    );
}
