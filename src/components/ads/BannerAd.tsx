"use client";

import { useEffect, useRef } from "react";

interface BannerAdProps {
    adKey: string;
    width: number;
    height: number;
    className?: string;
}

/**
 * BannerAd — Reusable Adsterra banner ad component.
 *
 * Adsterra's invoke.js uses document.write() to insert the ad iframe.
 * document.write() is SILENTLY IGNORED when called from a dynamically
 * inserted <script> element (browser security restriction).
 *
 * Solution: Load the ad inside its own <iframe> where document.write()
 * works natively. Each ad gets an isolated document context, which also
 * eliminates the global window.atOptions race condition between multiple ads.
 */
export function BannerAd({ adKey, width, height, className }: BannerAdProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return;
        if (!iframeRef.current) return;

        loadedRef.current = true;

        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Write the ad scripts directly into the iframe's document.
        // This allows Adsterra's invoke.js to use document.write() natively.
        doc.open();
        doc.write(`<!DOCTYPE html>
<html>
<head>
<style>
    html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: transparent;
    }
</style>
</head>
<body>
<script type="text/javascript">
    atOptions = {
        'key' : '${adKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
    };
</script>
<script type="text/javascript" src="https://glamournakedemployee.com/${adKey}/invoke.js"><\/script>
</body>
</html>`);
        doc.close();

        return () => {
            loadedRef.current = false;
            // Clean up iframe content on unmount
            try {
                const cleanDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (cleanDoc) {
                    cleanDoc.open();
                    cleanDoc.write("");
                    cleanDoc.close();
                }
            } catch {
                // Ignore cross-origin cleanup errors
            }
        };
    }, [adKey, width, height]);

    return (
        <div className={`flex justify-center items-center w-full overflow-hidden ${className || ""}`}>
            <iframe
                ref={iframeRef}
                width={width}
                height={height}
                style={{
                    border: "none",
                    overflow: "hidden",
                    background: "transparent",
                }}
                scrolling="no"
                title={`ad-${adKey}`}
            />
        </div>
    );
}
