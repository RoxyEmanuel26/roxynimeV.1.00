"use client";

import { useDataSaver } from "@/context/DataSaverContext";
import { useEffect, useState } from "react";

export function DataSaverBanner() {
    const { isHemat, toggleHemat, savedBytes } = useDataSaver();
    const [visible, setVisible] = useState(true);

    if (!isHemat || !visible) return null;

    // Format bytes ke KB/MB
    const formatSaved = (bytes: number) => {
        if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
        if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${Math.round(bytes)} B`;
    };

    return (
        <div className="w-full bg-amber-950/95 border-b
      border-amber-500/30 sticky top-0 z-[60]">
            <div className="container mx-auto px-4 max-w-7xl py-2
        flex items-center justify-between gap-3 text-sm">

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Badge mode */}
                    <span className="flex items-center gap-1
            bg-amber-500/20 border border-amber-500/30
            text-amber-300 text-xs font-bold
            rounded-full px-2.5 py-0.5">
                        ⚡ ULTRA HEMAT
                    </span>

                    {/* Counter real-time */}
                    <span className="text-amber-400/80 text-xs hidden sm:block">
                        Sudah hemat:
                        <span className="text-amber-300 font-bold ml-1">
                            {formatSaved(savedBytes)}
                        </span>
                        {" "}sejak buka halaman ini
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Progress bar penghematan */}
                    <div className="hidden md:flex items-center gap-1.5">
                        <span className="text-xs text-amber-400/50">Iklan:</span>
                        <span className="text-xs text-green-400 font-medium">✓ Aktif</span>
                    </div>

                    <button
                        onClick={toggleHemat}
                        className="text-xs px-3 py-1.5 rounded-lg
              bg-amber-500/15 hover:bg-amber-500/25
              border border-amber-500/25
              text-amber-300 hover:text-amber-200
              transition-all duration-200"
                    >
                        Matikan
                    </button>

                    <button
                        onClick={() => setVisible(false)}
                        className="text-amber-400/40 hover:text-amber-400/80
              transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
