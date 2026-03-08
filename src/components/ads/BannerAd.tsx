"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface BannerAdProps {
    className?: string;
    slot?: string;
}

/**
 * BannerAd — Responsive multi-network banner.
 * Picks a random ad from enabled networks (Adsterra/ExoClick/PropellerAds/HilltopAds).
 * Desktop: 728x90 | Tablet: 468x60 | Mobile: 320x50
 */
export function BannerAd({ className, slot = "default" }: BannerAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("banner", slot);
    if (!ad) return null;

    return (
        <div className={cn("w-full flex justify-center my-3", className)}>
            {/* Desktop 728x90 */}
            <div className="hidden lg:flex justify-center">
                <iframe
                    title={`ad-banner-desktop-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 728, 90)}
                    width={728}
                    height={90}
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                />
            </div>

            {/* Tablet 468x60 */}
            <div className="hidden sm:flex lg:hidden justify-center">
                <iframe
                    title={`ad-banner-tablet-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 468, 60)}
                    width={468}
                    height={60}
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                />
            </div>

            {/* Mobile 320x50 */}
            <div className="flex sm:hidden justify-center">
                <iframe
                    title={`ad-banner-mobile-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 320, 50)}
                    width={320}
                    height={50}
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                />
            </div>
        </div>
    );
}
