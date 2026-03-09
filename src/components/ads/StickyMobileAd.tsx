"use client";

import { useEffect, useRef, useState, useId } from "react";
import { X } from "lucide-react";

/**
 * StickyMobileAd — Fixed bottom 320x50 banner on mobile/tablet.
 * Dismissible for the session via sessionStorage.
 */
export function StickyMobileAd() {
    const [dismissed, setDismissed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const uniqueId = useId().replace(/:/g, "");

    useEffect(() => {
        setMounted(true);
        const wasDismissed = sessionStorage.getItem("sticky-ad-dismissed");
        if (wasDismissed) setDismissed(true);
    }, []);

    useEffect(() => {
        if (!mounted || dismissed || loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        const container = containerRef.current;

        // FIXED: 320x50 banner (Set B — aba7098d25b574b0f3cda75504b6f8e6)
        const opts = document.createElement("script");
        opts.type = "text/javascript";
        opts.text = `atOptions = { 'key':'aba7098d25b574b0f3cda75504b6f8e6', 'format':'iframe', 'height':50, 'width':320, 'params':{} };`;
        container.appendChild(opts);

        const inv = document.createElement("script");
        inv.type = "text/javascript";
        inv.src = "https://balkliving.com/aba7098d25b574b0f3cda75504b6f8e6/invoke.js";
        inv.async = true;
        container.appendChild(inv);
    }, [mounted, dismissed]);

    if (!mounted || dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("sticky-ad-dismissed", "1");
    };

    return (
        <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border flex items-center justify-center py-1 px-2 gap-1 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
        >
            <button
                onClick={handleDismiss}
                className="absolute top-0 right-0 -translate-y-full bg-background/90 border border-border border-b-0 rounded-t-md px-1.5 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close ad"
            >
                <X className="h-3 w-3" />
            </button>
            <div
                ref={containerRef}
                id={`ad-sticky-${uniqueId}`}
                style={{ minWidth: 320, minHeight: 50 }}
            />
        </div>
    );
}
