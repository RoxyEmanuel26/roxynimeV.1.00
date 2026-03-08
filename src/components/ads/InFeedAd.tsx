"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface InFeedAdProps {
    className?: string;
    slot?: string;
}

/**
 * InFeedAd — 300x250 rectangle ad placed between content sections.
 * Picks from enabled networks' rectangle ads, falls back to banners.
 */
export function InFeedAd({ className, slot = "feed" }: InFeedAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("rectangle", slot);
    if (!ad) return null;

    return (
        <div className={cn("w-full flex justify-center my-4", className)}>
            <div className="glass-card p-2 rounded-xl inline-flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Advertisement
                </span>
                <iframe
                    title={`ad-infeed-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 300, 250)}
                    width={300}
                    height={250}
                    style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                    scrolling="no"
                />
            </div>
        </div>
    );
}
