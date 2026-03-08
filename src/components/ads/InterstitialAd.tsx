"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pickAdForSlot, generateAdSrcDoc } from "@/config/ads.config";

interface InterstitialAdProps {
    show: boolean;
    onClose: () => void;
    autoCloseDelay?: number;
}

/**
 * InterstitialAd — Full-screen overlay ad with countdown.
 * Uses interstitial ad units, falls back to rectangles/banners.
 */
export function InterstitialAd({
    show,
    onClose,
    autoCloseDelay = 5,
}: InterstitialAdProps) {
    const [countdown, setCountdown] = useState(autoCloseDelay);
    const [canClose, setCanClose] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!show) {
            setCountdown(autoCloseDelay);
            setCanClose(false);
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanClose(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [show, autoCloseDelay]);

    if (!show || !mounted) return null;

    const ad = pickAdForSlot("interstitial", "interstitial-overlay");
    if (!ad) {
        // No ad available, auto-close
        onClose();
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
            <div className="relative glass-card w-full max-w-sm mx-4 p-4">
                {/* Close button */}
                <button
                    onClick={canClose ? onClose : undefined}
                    className={cn(
                        "absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        canClose
                            ? "bg-destructive text-white hover:bg-destructive/80 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={!canClose}
                >
                    {canClose ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <span className="text-xs font-bold">{countdown}</span>
                    )}
                </button>

                {/* Ad content */}
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Advertisement
                    </span>
                    <iframe
                        title="Interstitial Ad"
                        srcDoc={generateAdSrcDoc(ad, 300, 250)}
                        width={300}
                        height={250}
                        style={{ border: "none", overflow: "hidden", borderRadius: "8px" }}
                        scrolling="no"
                    />
                    {canClose && (
                        <button onClick={onClose} className="btn-primary w-full text-sm mt-1">
                            Lanjut Nonton
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
