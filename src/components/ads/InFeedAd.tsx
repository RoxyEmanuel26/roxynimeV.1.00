"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface InFeedAdProps {
    className?: string;
    slot?: string;
}

/**
 * InFeedAd — Responsive rectangle ad between content sections.
 * Desktop: 300x250 | Mobile: 250x250 (fits small screens)
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

                {/* Desktop/Tablet: 300x250 */}
                <div className="hidden sm:block">
                    <iframe
                        title={`ad-infeed-desktop-${slot}`}
                        srcDoc={generateAdSrcDoc(ad, 300, 250)}
                        width={300}
                        height={250}
                        style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                        scrolling="no"
                    />
                </div>

                {/* Mobile: 250x250 (fits narrow screens) */}
                <div className="block sm:hidden">
                    <iframe
                        title={`ad-infeed-mobile-${slot}`}
                        srcDoc={generateAdSrcDoc(ad, 250, 250)}
                        width={250}
                        height={250}
                        style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                        scrolling="no"
                    />
                </div>
            </div>
        </div>
    );
}
