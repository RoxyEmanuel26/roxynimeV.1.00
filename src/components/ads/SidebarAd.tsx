"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SidebarAdProps {
    className?: string;
    position?: "left" | "right"; // Posisi sidebar
}

export function SidebarAd({ className, position = "right" }: SidebarAdProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isScriptLoaded = useRef(false);

    useEffect(() => {
        // Pastikan script hanya dimuat sekali
        if (isScriptLoaded.current || !containerRef.current) return;

        try {
            // Set atOptions untuk sidebar Adsterra (160x600)
            // @ts-ignore
            window.atOptionsSidebar = {
                key: "d558679ec97b5a1d31760db5c4fbfb64",
                format: "iframe",
                height: 600,
                width: 160,
                params: {}
            };

            // Buat dan inject script Adsterra
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://www.highperformanceformat.com/d558679ec97b5a1d31760db5c4fbfb64/invoke.js";
            script.async = true;

            // Append script ke container
            containerRef.current.appendChild(script);
            isScriptLoaded.current = true;

            // Debug log (hapus setelah testing)
            console.log("Adsterra Sidebar Ad script loaded");
        } catch (error) {
            console.error("Error loading Adsterra sidebar ad:", error);
        }
    }, []);

    return (
        <aside
            className={cn(
                // Hanya tampil di layar besar (≥1280px)
                "hidden xl:block",
                "w-[160px] min-h-[600px]",
                // Spacing berdasarkan posisi
                position === "left" ? "mr-6" : "ml-6",
                className
            )}
            aria-label={`${position} sidebar advertisement`}
        >
            {/* Container untuk sidebar ad dengan sticky positioning */}
            <div
                ref={containerRef}
                className={cn(
                    "sticky top-20", // Jarak dari atas (sesuaikan dengan tinggi navbar)
                    "w-[160px] min-h-[600px]",
                    "flex flex-col items-center justify-start",
                    "bg-gray-900/20 rounded-lg", // Background fallback sebelum ads load
                    "overflow-hidden"
                )}
                id={`adsterra-sidebar-${position}`}
            >
                {/* Fallback content saat ads belum load */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-xs p-4 text-center">
                    <span className="mb-2">Advertisement</span>
                    <span className="text-[10px] opacity-50">160x600</span>
                </div>
            </div>
        </aside>
    );
}
