"use client";

import { useDataSaver } from "@/context/DataSaverContext";
import { Zap, ZapOff } from "lucide-react";

export function DataSaverToggle() {
    const { isHemat, toggleHemat } = useDataSaver();

    return (
        <button
            onClick={toggleHemat}
            title={
                isHemat
                    ? "Mode Hemat Aktif — Klik untuk matikan"
                    : "Aktifkan Mode Hemat Data"
            }
            className={`
        relative w-9 h-9 rounded-lg flex items-center justify-center
        border transition-all duration-200 group
        ${isHemat
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70"
                }
      `}
        >
            {isHemat ? (
                <Zap className="h-4 w-4 fill-amber-400" />
            ) : (
                <ZapOff className="h-4 w-4" />
            )}

            {/* Tooltip */}
            <span
                className="
          absolute -bottom-9 left-1/2 -translate-x-1/2
          whitespace-nowrap text-[10px]
          bg-gray-900 text-white/70 border border-white/10
          rounded-lg px-2 py-1
          opacity-0 group-hover:opacity-100
          pointer-events-none
          transition-opacity duration-200
          z-50
        "
            >
                {isHemat ? "Mode Hemat: ON" : "Mode Hemat: OFF"}
            </span>
        </button>
    );
}
