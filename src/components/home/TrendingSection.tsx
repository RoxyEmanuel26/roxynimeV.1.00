"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimeCard } from "@/components/anime";
import type { Anime } from "./HeroSection";
import { ChevronRight } from "lucide-react";

const FILTER_TABS = [
    { id: "all", label: "All", icon: "📺" },
    { id: "ongoing", label: "Ongoing", icon: "🟢" },
    { id: "complete", label: "Complete", icon: "✅" },
    { id: "movie", label: "Movie", icon: "🎬" },
] as const;

interface TrendingSectionProps {
    animes: Anime[];
}

export function TrendingSection({ animes }: TrendingSectionProps) {
    const [activeTab, setActiveTab] = useState<string>("all");

    if (!animes || animes.length === 0) return null;

    const filteredAnimes = animes.filter(anime => {
        if (activeTab === "all") return true;

        const statusLower = (anime.status || "").toLowerCase();
        const typeStr = Array.isArray(anime.type)
            ? anime.type.join(" ").toLowerCase()
            : (anime.type || "").toLowerCase();

        switch (activeTab) {
            case "ongoing":
                return statusLower === "ongoing" || statusLower === "";
            case "complete":
                return statusLower === "completed" || statusLower === "complete";
            case "movie":
                return typeStr.includes("movie") || typeStr.includes("film") || statusLower === "movie";
            default:
                return true;
        }
    });

    // Show up to 50 items
    const displayAnimes = filteredAnimes.slice(0, 50);

    return (
        <section className="pt-6 pb-8 sm:pt-8 sm:pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* ═══ Header: Title + Filter Tabs ═══ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <h2
                        className="text-2xl sm:text-3xl font-bold flex items-center gap-2"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        <span>Trending</span>
                        <span className="text-red-500">Now</span>
                        <span className="text-xl">🔥</span>
                    </h2>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={activeTab === tab.id ? "filter-tab-active" : "filter-tab"}
                            >
                                <span className="hidden sm:inline mr-1">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ═══ Anime Grid — 5 cols desktop ═══ */}
                {displayAnimes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-5">
                        {displayAnimes.map((anime, index) => (
                            <AnimeCard
                                key={anime.id || anime.slug || `trending-${index}`}
                                id={anime.id || anime.slug || ""}
                                slug={anime.slug}
                                title={anime.title}
                                image={anime.image}
                                episode={anime.episode}
                                rating={anime.rating}
                                type={anime.type}
                                source={anime._source}
                                priority={index < 5}
                                status={anime.status}
                                description={anime.description}
                                genres={Array.isArray(anime.type) ? anime.type : anime.type ? [anime.type] : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">Tidak ada anime untuk filter &quot;{activeTab}&quot;</p>
                        <button
                            onClick={() => setActiveTab("all")}
                            className="mt-3 text-sm text-primary hover:underline"
                        >
                            Tampilkan semua
                        </button>
                    </div>
                )}

                {/* ═══ "Series Terbaru" Button ═══ */}
                <div className="mt-8 flex justify-center">
                    <Link
                        href="/browse"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
                            border border-white/15 bg-white/5 text-white/80
                            hover:bg-white/10 hover:border-white/25 hover:text-white
                            transition-all duration-200"
                    >
                        Series Terbaru
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
