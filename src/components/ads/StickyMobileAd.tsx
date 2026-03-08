"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

/**
 * StickyMobileAd — Fixed bottom banner that sticks to the screen.
 * Only visible on mobile/tablet (<lg). Shows a small 320x50 ad.
 * User can dismiss it for the session.
 */
export function StickyMobileAd() {
    const [mounted, setMounted] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check if user dismissed it this session
        const wasDismissed = sessionStorage.getItem("sticky-ad-dismissed");
        if (wasDismissed) setDismissed(true);
    }, []);

    if (!mounted || dismissed) return null;

    const ad = pickAdForSlot("banner", "sticky-mobile");
    if (!ad) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("sticky-ad-dismissed", "1");
    };

    return (
        <div
            className={cn(
                "lg:hidden fixed bottom-0 left-0 right-0 z-50",
                "bg-background/95 backdrop-blur-sm border-t border-border",
                "flex items-center justify-center py-1 px-2 gap-1",
                "shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
            )}
        >
            {/* Close button */}
            <button
                onClick={handleDismiss}
                className="absolute top-0 right-0 -translate-y-full bg-background/90 border border-border border-b-0 rounded-t-md px-1.5 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close ad"
            >
                <X className="h-3 w-3" />
            </button>

            <iframe
                title="Sticky Mobile Ad"
                srcDoc={generateAdSrcDoc(ad, 320, 50)}
                width={320}
                height={50}
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
            />
        </div>
    );
}
