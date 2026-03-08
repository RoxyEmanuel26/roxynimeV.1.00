"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderOption {
    id: string;
    name: string;
    icon: string;
    description: string;
    contentType: string;
}

const PROVIDERS: ProviderOption[] = [
    { id: "otakudesu", name: "Otakudesu", icon: "🎌", description: "Sumber utama", contentType: "Anime" },
    { id: "samehadaku", name: "Samehadaku", icon: "🦈", description: "Alternatif populer", contentType: "Anime" },
    { id: "donghua", name: "Donghua", icon: "🐉", description: "Chinese Animation", contentType: "Donghua" },
    { id: "anoboy", name: "Anoboy", icon: "📺", description: "Nonton anime", contentType: "Anime" },
    { id: "oploverz", name: "Oploverz", icon: "💎", description: "Kualitas terbaik", contentType: "Anime" },
];

const STORAGE_KEY = "roxynime_provider";

interface ProviderSelectorProps {
    onProviderChange: (providerId: string) => void;
    className?: string;
}

export function ProviderSelector({ onProviderChange, className }: ProviderSelectorProps) {
    const [selectedId, setSelectedId] = useState("otakudesu");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && PROVIDERS.find((p) => p.id === saved)) {
            setSelectedId(saved);
            onProviderChange(saved);
        }
    }, [onProviderChange]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (provider: ProviderOption) => {
        setSelectedId(provider.id);
        localStorage.setItem(STORAGE_KEY, provider.id);
        onProviderChange(provider.id);
        setIsOpen(false);
    };

    const selected = PROVIDERS.find((p) => p.id === selectedId) || PROVIDERS[0];

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50",
                    "bg-card hover:bg-muted/50 transition-all duration-200",
                    "text-sm font-medium min-w-[160px]",
                    isOpen && "ring-2 ring-primary/50 border-primary/50"
                )}
            >
                <span className="text-lg">{selected.icon}</span>
                <span className="flex-1 text-left">{selected.name}</span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 z-50 rounded-xl border border-border/50 bg-card shadow-xl overflow-hidden fade-in">
                    <div className="p-2 border-b border-border/30">
                        <p className="text-xs text-muted-foreground px-2 py-1">
                            Pilih sumber anime
                        </p>
                    </div>
                    <div className="py-1 max-h-[280px] overflow-y-auto">
                        {PROVIDERS.map((provider) => (
                            <button
                                key={provider.id}
                                onClick={() => handleSelect(provider)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-left",
                                    "hover:bg-muted/50 transition-colors duration-150",
                                    provider.id === selectedId && "bg-primary/10 text-primary"
                                )}
                            >
                                <span className="text-xl">{provider.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{provider.name}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                            {provider.contentType}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {provider.description}
                                    </p>
                                </div>
                                {provider.id === selectedId && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
