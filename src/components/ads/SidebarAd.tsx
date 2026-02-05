"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
    className?: string;
    position?: "left" | "right";
}

export function SidebarAd({ className, position = "right" }: SidebarAdProps) {
    const [adConfig, setAdConfig] = useState<{ key: string; height: number; width: number } | null>(null);

    useEffect(() => {
        // Adsterra Keys Configuration for Sidebar
        const adConfigs = [
            { key: "d558679ec97b5a1d31760db5c4fbfb64", width: 160, height: 600 }, // Key 1 (Tall)
            { key: "c6c61680cd72bd1e008d3e726deca30a", width: 160, height: 300 }  // Key 2 (Short)
        ];

        // Randomly select one config
        const selected = adConfigs[Math.floor(Math.random() * adConfigs.length)];
        setAdConfig(selected);
    }, []);

    if (!adConfig) return null;

    const srcDoc = `
        <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:flex-start;height:100vh;overflow:hidden;background-color:transparent;">
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
        <aside
            className={cn(
                "hidden xl:block",
                "w-[160px]",
                // Min height matches the TALLEST ad (600px) to prevent layout shifts jumping 
                // OR match the current ad height if we want it to shrink.
                // Keeping min-h-[600px] maintains the sidebar "space" feel.
                "min-h-[600px]",
                position === "left" ? "mr-6" : "ml-6",
                className
            )}
            aria-label={`${position} sidebar advertisement`}
        >
            <div className="sticky top-20 w-[160px] flex justify-center">
                <iframe
                    title="Sidebar Advertisement"
                    srcDoc={srcDoc}
                    width={adConfig.width}
                    height={adConfig.height}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                />
            </div>
        </aside>
    );
}
