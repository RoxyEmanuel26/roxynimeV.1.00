"use client";

import { useEffect, useRef, useId } from "react";

interface InFeedAdProps {
    /** Ad key — defaults to 300x250 Set A */
    adKey?: string;
    width?: number;
    height?: number;
    className?: string;
}

/**
 * InFeedAd — 300x250 rectangle ad injected between content sections.
 * Wraps in a glass-card container with "Advertisement" label.
 */
export function InFeedAd({
    adKey = "4c1772859ec58ab31d3e31f5a867698e",
    width = 300,
    height = 250,
    className,
}: InFeedAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const loadedRef = useRef(false);
    const uniqueId = useId().replace(/:/g, "");

    useEffect(() => {
        if (loadedRef.current || !containerRef.current) return;
        loadedRef.current = true;

        const container = containerRef.current;

        // FIXED: Set atOptions sebelum invoke.js
        const opts = document.createElement("script");
        opts.type = "text/javascript";
        opts.text = `atOptions = { 'key':'${adKey}', 'format':'iframe', 'height':${height}, 'width':${width}, 'params':{} };`;
        container.appendChild(opts);

        const inv = document.createElement("script");
        inv.type = "text/javascript";
        inv.src = `https://balkliving.com/${adKey}/invoke.js`;
        inv.async = true;
        container.appendChild(inv);
    }, [adKey, width, height]);

    return (
        <div className={`w-full flex justify-center my-4 ${className || ""}`}>
            <div className="glass-card p-2 rounded-xl inline-flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Advertisement
                </span>
                <div
                    ref={containerRef}
                    id={`ad-infeed-${uniqueId}`}
                    style={{ minWidth: width, minHeight: height, overflow: "hidden" }}
                />
            </div>
        </div>
    );
}
