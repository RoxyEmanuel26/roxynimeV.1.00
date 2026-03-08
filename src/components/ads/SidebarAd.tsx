"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface SidebarAdProps {
    className?: string;
    position?: "left" | "right";
}

/**
 * SidebarAd — Responsive sidebar ad.
 * Desktop/Tablet (lg+): Sticky vertical 160x600
 * Mobile (<lg): Horizontal 300x250 rectangle (full width centered)
 */
export function SidebarAd({ className, position = "right" }: SidebarAdProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const ad = pickAdForSlot("rectangle", `sidebar-${position}`);
    if (!ad) return null;

    return (
        <>
            {/* Desktop: Sticky vertical sidebar */}
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
                        title={`Sidebar Ad Desktop ${position}`}
                        srcDoc={generateAdSrcDoc(ad, 160, 600)}
                        width={160}
                        height={600}
                        style={{ border: "none", overflow: "hidden" }}
                        scrolling="no"
                    />
                </div>
            </aside>

            {/* Mobile/Tablet: Horizontal rectangle */}
            <div className="lg:hidden w-full flex justify-center my-4">
                <div className="glass-card p-2 rounded-xl inline-flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Sponsored
                    </span>
                    <iframe
                        title={`Sidebar Ad Mobile ${position}`}
                        srcDoc={generateAdSrcDoc(ad, 300, 250)}
                        width={300}
                        height={250}
                        style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                        scrolling="no"
                    />
                </div>
            </div>
        </>
    );
}
