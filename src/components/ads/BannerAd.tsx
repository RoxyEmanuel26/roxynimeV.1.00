"use client";

import { useEffect, useRef, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface BannerAdProps {
    className?: string;
}

export function BannerAd({ className }: BannerAdProps) {
    const [adConfig, setAdConfig] = useState<{ key: string; height: number; width: number } | null>(null);

    useEffect(() => {
        // Adsterra Keys Configuration (728x90)
        const adKeys = [
            "1d4f1463e95b8d3fb84adadeb3a2f170", // Key 1
            "c89ece9ff04cd88930d8cf0f5e62f70f"  // Key 2
        ];

        // Randomly select one key on mount
        const selectedKey = adKeys[Math.floor(Math.random() * adKeys.length)];

        setAdConfig({
            key: selectedKey,
            height: 90,
            width: 728
        });
    }, []);

    if (!adConfig) return null;

    const srcDoc = `
        <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;background-color:transparent;">
                <script type="text/javascript">
                    atOptions = {
                        'key' : '${adConfig.key}',
                        'format' : 'iframe',
                        'height' : ${adConfig.height},
                        'width' : ${adConfig.width},
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="https://www.highperformanceformat.com/${adConfig.key}/invoke.js"></script>
            </body>
        </html>
    `;

    return (
        <div className={cn("w-full max-w-[728px] mx-auto my-2 overflow-hidden", className)}>
            {/* Desktop Banner 728x90 */}
            <div className="hidden lg:flex justify-center items-center h-[90px] w-[728px] mx-auto">
                <iframe
                    title="Advertisement"
                    srcDoc={srcDoc}
                    width={728}
                    height={90}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                />
            </div>

            {/* Mobile Banner - Placeholder/Fallback */}
            {/* Note: Adsterra 728x90 keys usually don't scale to mobile. 
                Ideally we should use a distinct mobile key (320x50) here if available.
                For now we keep the placeholder.
            */}
            <div className="lg:hidden flex justify-center items-center min-h-[50px] bg-gray-800/30 rounded-lg">
                <span className="text-xs text-gray-400">Advertisement</span>
            </div>
        </div>
    );
}
