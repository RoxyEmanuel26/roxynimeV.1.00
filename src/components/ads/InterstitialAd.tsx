"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterstitialAdProps {
    show: boolean;
    onClose: () => void;
    autoCloseDelay?: number; // in seconds
}

export function InterstitialAd({
    show,
    onClose,
    autoCloseDelay = 5,
}: InterstitialAdProps) {
    const [countdown, setCountdown] = useState(autoCloseDelay);
    const [canClose, setCanClose] = useState(false);

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

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative glass-card w-full max-w-lg mx-4 p-6">
                {/* Close Button */}
                <button
                    onClick={canClose ? onClose : undefined}
                    className={cn(
                        "absolute top-4 right-4 p-2 rounded-lg transition-all",
                        canClose
                            ? "hover:bg-muted cursor-pointer"
                            : "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!canClose}
                >
                    {canClose ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <span className="text-sm font-medium">{countdown}s</span>
                    )}
                </button>

                {/* Ad Content */}
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Advertisement
                    </p>
                    <div className="ad-placeholder h-[250px] w-full">
                        <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-xs font-medium">Interstitial Ad</span>
                            <span className="text-[10px]">300x250</span>
                        </div>
                    </div>
                    {canClose && (
                        <button onClick={onClose} className="btn-primary w-full">
                            Continue Watching
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
