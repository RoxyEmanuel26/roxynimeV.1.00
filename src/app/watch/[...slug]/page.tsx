"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ChevronLeft,
    ChevronRight,
    List,
    X,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { VideoPlayer } from "@/components/player";
import { EpisodeList } from "@/components/anime";
import { BannerAd, InterstitialAd } from "@/components/ads";
import { VideoPlayerSkeleton } from "@/components/common";
import { cn } from "@/lib/utils";

interface Episode {
    id: string;
    number: number;
    title?: string;
    slug: string;
}

interface StreamData {
    title: string;
    episode: string;
    streams: { quality: string; url: string; type: string }[];
}

interface AnimeInfo {
    title: string;
    image: string;
    episodes: { episode: string; slug: string }[];
}

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const animeId = params.slug?.[0] as string;
    const episodeId = params.slug?.[1] as string || "1";

    const [loading, setLoading] = useState(true);
    const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
    const [streamData, setStreamData] = useState<StreamData | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<number>(parseInt(episodeId));
    const [showEpisodeList, setShowEpisodeList] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch anime info and streaming data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch anime details first
            const animeRes = await fetch(`/api/anime/${animeId}`);
            if (!animeRes.ok) throw new Error("Failed to fetch anime info");
            const animeData = await animeRes.json();

            if (!animeData.data) throw new Error("No anime data found");

            setAnimeInfo(animeData.data);

            // Parse episodes correctly from API matching animbus.ts structure
            // { id: string, number: number, title: string, urlSlug: string }
            const eps: Episode[] = (animeData.data.episodes || []).map((ep: any) => ({
                id: ep.id || ep.urlSlug, // Key for React
                number: ep.number,
                title: ep.title,
                slug: ep.urlSlug || ep.id // Slug for API calls
            }));

            setEpisodes(eps);

            // 2. Find the current episode slug
            // params.slug[1] is the episode number (e.g., "1", "2")
            const targetEpNum = parseInt(episodeId);
            const currentEp = eps.find(e => e.number === targetEpNum);

            if (currentEp) {
                // Use the found slug to fetch streams
                const streamRes = await fetch(`/api/streaming/${animeId}/${currentEp.slug}`);
                if (streamRes.ok) {
                    const streamJson = await streamRes.json();
                    if (streamJson.data) {
                        setStreamData(streamJson.data);
                    }
                } else {
                    console.warn("Stream fetch failed:", streamRes.status);
                    // Don't set error here, just show "No streams" state
                }
            } else {
                console.warn(`Episode ${targetEpNum} not found in list`);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load video. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [animeId, episodeId]);

    useEffect(() => {
        fetchData();
        setCurrentEpisode(parseInt(episodeId));
    }, [fetchData, episodeId]);

    // Save watch progress
    const handleProgress = useCallback(
        async (progress: number) => {
            if (!session?.user?.id || !animeId) return;

            try {
                await fetch("/api/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        animeId,
                        episode: parseInt(episodeId),
                        progress,
                        title: animeInfo?.title || "",
                        image: animeInfo?.image || "",
                    }),
                });
            } catch (error) {
                console.error("Failed to save progress:", error);
            }
        },
        [session, animeId, episodeId, animeInfo]
    );

    // Handle episode end - show ad then go to next
    const handleEpisodeEnd = useCallback(() => {
        setShowAd(true);
    }, []);

    const handleAdClose = () => {
        setShowAd(false);
        // Go to next episode if available
        const currentIdx = episodes.findIndex((ep) => ep.number === currentEpisode);
        if (currentIdx < episodes.length - 1) {
            const nextEp = episodes[currentIdx + 1];
            router.push(`/watch/${animeId}/${nextEp.number}`);
        }
    };

    // Navigation
    const hasPrev = currentEpisode > 1;
    const hasNext = currentEpisode < episodes.length;

    const goToPrev = () => {
        if (hasPrev) {
            router.push(`/watch/${animeId}/${currentEpisode - 1}`);
        }
    };

    const goToNext = () => {
        if (hasNext) {
            router.push(`/watch/${animeId}/${currentEpisode + 1}`);
        }
    };

    const handleEpisodeSelect = (episode: Episode) => {
        router.push(`/watch/${animeId}/${episode.number}`);
        setShowEpisodeList(false);
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="glass-card p-8 text-center">
                    <p className="text-lg font-medium text-destructive mb-4">{error}</p>
                    <button onClick={fetchData} className="btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Interstitial Ad */}
            <InterstitialAd show={showAd} onClose={handleAdClose} />

            {/* Video Player Section */}
            <div className="relative">
                {loading ? (
                    <div className="container mx-auto px-4 py-4">
                        <VideoPlayerSkeleton />
                    </div>
                ) : streamData?.streams && streamData.streams.length > 0 ? (
                    <VideoPlayer
                        streams={streamData.streams}
                        title={animeInfo?.title || ""}
                        episodeTitle={`Episode ${currentEpisode}`}
                        onProgress={handleProgress}
                        onEnded={handleEpisodeEnd}
                        onPrev={goToPrev}
                        onNext={goToNext}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                    />
                ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">No streams available</p>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-card border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        {/* Title & Episode */}
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/anime/${animeId}`}
                                className="font-semibold hover:text-primary transition-colors truncate block"
                            >
                                {animeInfo?.title || "Loading..."}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                                Episode {currentEpisode}
                                {episodes.length > 0 && ` of ${episodes.length}`}
                            </p>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={goToPrev}
                                disabled={!hasPrev}
                                className="btn-outline px-3 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prev
                            </button>
                            <button
                                onClick={goToNext}
                                disabled={!hasNext}
                                className="btn-outline px-3 disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setShowEpisodeList(!showEpisodeList)}
                                className={cn(
                                    "btn-outline px-3",
                                    showEpisodeList && "bg-primary text-white"
                                )}
                            >
                                <List className="h-4 w-4" />
                                Episodes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Episode List Panel */}
            {showEpisodeList && (
                <div className="bg-card border-t border-border">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Episodes</h3>
                            <button
                                onClick={() => setShowEpisodeList(false)}
                                className="btn-ghost p-2"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <EpisodeList
                                episodes={episodes}
                                currentEpisode={currentEpisode}
                                onSelect={handleEpisodeSelect}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Episode Navigation (Mobile) */}
            <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2 z-40">
                <button
                    onClick={goToPrev}
                    disabled={!hasPrev}
                    className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                    <ChevronUp className="h-6 w-6 text-white" />
                </button>
                <button
                    onClick={goToNext}
                    disabled={!hasNext}
                    className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center disabled:opacity-50"
                >
                    <ChevronDown className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Content Below Player */}
            <div className="bg-background">
                <div className="container mx-auto px-4 py-8">
                    <BannerAd />
                </div>
            </div>
        </div>
    );
}
