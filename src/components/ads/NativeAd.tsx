"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface NativeAdProps {
    className?: string;
    slot?: string;
}

/**
 * NativeAd — Responsive small inline ad that blends with content.
 * Desktop: 468x60 | Tablet: 320x50 | Mobile: 300x50
 */
export function NativeAd({ className, slot = "native" }: NativeAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("native", slot);
    if (!ad) return null;

    return (
        <div className={cn("w-full flex justify-center my-2 px-2", className)}>
            {/* Desktop: 468x60 */}
            <div className="hidden md:block">
                <iframe
                    title={`ad-native-desktop-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 468, 60)}
                    width={468}
                    height={60}
                    style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                    scrolling="no"
                />
            </div>

            {/* Tablet: 320x50 */}
            <div className="hidden sm:block md:hidden">
                <iframe
                    title={`ad-native-tablet-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 320, 50)}
                    width={320}
                    height={50}
                    style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                    scrolling="no"
                />
            </div>

            {/* Mobile: 300x50 */}
            <div className="block sm:hidden">
                <iframe
                    title={`ad-native-mobile-${slot}`}
                    srcDoc={generateAdSrcDoc(ad, 300, 50)}
                    width={300}
                    height={50}
                    style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                    scrolling="no"
                />
            </div>
        </div>
    );
}
