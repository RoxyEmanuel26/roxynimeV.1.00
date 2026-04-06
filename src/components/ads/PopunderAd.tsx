"use client";

import Script from "next/script";
import { getEnabledGlobalScripts } from "@/config/ads.config";

/**
 * PopunderAd — Renders all enabled global ad scripts (popunder, social bar, monetag, etc.)
 * All script URLs are configured centrally in src/config/ads.config.ts
 */
export function PopunderAd() {
    const scripts = getEnabledGlobalScripts();

    return (
        <>
            {scripts.map((script) => {
                if (script.inline) {
                    return (
                        <Script
                            key={script.id}
                            id={script.id}
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{ __html: script.inline }}
                        />
                    );
                }

                if (script.src) {
                    return (
                        <Script
                            key={script.id}
                            id={script.id}
                            src={script.src}
                            strategy="afterInteractive"
                        />
                    );
                }

                return null;
            })}
        </>
    );
}
