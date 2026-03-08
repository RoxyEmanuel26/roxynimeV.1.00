"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface SidebarAdProps {
    className?: string;
    position?: "left" | "right";
}

/**
 * SidebarAd — Sticky sidebar ad. Visible on lg+ screens.
 * Picks from enabled networks' rectangle or banner ads.
 */
export function SidebarAd({ className, position = "right" }: SidebarAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("rectangle", `sidebar-${position}`);
    if (!ad) return null;

    return (
        <aside
            className={cn(
                "hidden lg:block",
                "w-[160px] shrink-0",
                position === "left" ? "mr-4" : "ml-4",
                className
            )}
            aria-label={`${position} sidebar advertisement`}
        >
            <div className="sticky top-20 w-[160px] flex justify-center">
                <iframe
                    title="Sidebar Advertisement"
                    srcDoc={generateAdSrcDoc(ad, 160, 600)}
                    width={160}
                    height={600}
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                />
            </div>
        </aside>
    );
}
