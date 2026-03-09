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
import { BannerAd, InterstitialAd, InFeedAd, NativeAd } from "@/components/ads";
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
    episodes: { episode: string; slug: string; number: number }[];
}

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const animeId = params.slug?.[0] as string;
    const episodeSlug = params.slug?.[1] as string; // Could be slug or number

    const [loading, setLoading] = useState(true);
    const [animeInfo, setAnimeInfo] = useState<AnimeInfo | null>(null);
    const [streamData, setStreamData] = useState<StreamData | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<number>(1);
    const [showEpisodeList, setShowEpisodeList] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch anime info and streaming data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("=== FETCH DATA START ===");
            console.log("Anime ID:", animeId);
            console.log("Episode Slug/Number:", episodeSlug);

            // 1. Fetch anime details first
            const animeRes = await fetch(`/api/anime/${animeId}`);
            if (!animeRes.ok) {
                const errorText = await animeRes.text();
                console.error("Anime fetch failed:", animeRes.status, errorText);
                throw new Error("Failed to fetch anime info");
            }

            const animeData = await animeRes.json();
            console.log("Anime data received:", animeData);

            if (!animeData.data) throw new Error("No anime data found");

            setAnimeInfo(animeData.data);

            // Parse episodes correctly from API
            const eps: Episode[] = (animeData.data.episodes || []).map((ep: any) => ({
                id: ep.id || ep.urlSlug || ep.slug,
                number: ep.number,
                title: ep.title,
                slug: ep.urlSlug || ep.slug || ep.id,
            }));

            console.log("Parsed episodes:", eps);
            setEpisodes(eps);

            // 2. Determine current episode
            let currentEp: Episode | undefined;

            // Try to match by slug first (if episodeSlug looks like a slug)
            if (episodeSlug && isNaN(Number(episodeSlug))) {
                console.log("Matching by slug:", episodeSlug);
                currentEp = eps.find(
                    (e) =>
                        e.slug === episodeSlug ||
                        e.id === episodeSlug ||
                        e.slug?.toLowerCase() === episodeSlug.toLowerCase()
                );
            } else {
                // Match by episode number
                const epNum = parseInt(episodeSlug || "1");
                console.log("Matching by number:", epNum);
                currentEp = eps.find((e) => e.number === epNum);
            }

            // Fallback to first episode if not found
            if (!currentEp && eps.length > 0) {
                console.warn(
                    `Episode not found: ${episodeSlug}, using first episode`
                );
                currentEp = eps[0];
            }

            if (!currentEp) {
                throw new Error("No episodes available");
            }

            console.log("Current episode found:", currentEp);
            setCurrentEpisode(currentEp.number);

            // 3. Fetch streams using the episode's slug
            const streamUrl = `/api/streaming/${animeId}/${currentEp.slug}`;
            console.log("Fetching streams from:", streamUrl);

            const streamRes = await fetch(streamUrl);

            if (!streamRes.ok) {
                const errorText = await streamRes.text();
                console.error("Stream fetch failed:", streamRes.status, errorText);
                // Don't throw error, just show no streams message
            } else {
                const streamJson = await streamRes.json();
                console.log("Stream response:", streamJson);

                if (streamJson.data && streamJson.data.streams) {
                    if (streamJson.data.streams.length > 0) {
                        setStreamData(streamJson.data);
                        console.log("Streams loaded successfully:", streamJson.data.streams.length);
                    } else {
                        console.warn("No streams in response");
                    }
                } else {
                    console.warn("Invalid stream data structure");
                }
            }

            console.log("=== FETCH DATA END ===");
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err instanceof Error ? err.message : "Failed to load video. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [animeId, episodeSlug]);

    useEffect(() => {
        if (animeId && episodeSlug) {
            fetchData();
        }
    }, [animeId, episodeSlug, fetchData]);

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
                        episode: currentEpisode,
                        progress,
                        title: animeInfo?.title || "",
                        image: animeInfo?.image || "",
                    }),
                });
            } catch (error) {
                console.error("Failed to save progress:", error);
            }
        },
        [session, animeId, currentEpisode, animeInfo]
    );

    // Navigation logic with auto-detection of sort order
    const currentIdx = episodes.findIndex((ep) => ep.number === currentEpisode);
    const isAscending = episodes.length > 1 && episodes[0].number < episodes[episodes.length - 1].number;

    const prevIndex = isAscending ? currentIdx - 1 : currentIdx + 1;
    const nextIndex = isAscending ? currentIdx + 1 : currentIdx - 1;

    // Check bounds
    const hasPrev = prevIndex >= 0 && prevIndex < episodes.length;
    const hasNext = nextIndex >= 0 && nextIndex < episodes.length;

    const goToPrev = () => {
        if (hasPrev) {
            router.push(`/watch/${animeId}/${episodes[prevIndex].slug}`);
        }
    };

    const goToNext = () => {
        if (hasNext) {
            router.push(`/watch/${animeId}/${episodes[nextIndex].slug}`);
        }
    };

    // Handle episode end - show ad then go to next
    const handleEpisodeEnd = useCallback(() => {
        setShowAd(true);
    }, []);

    const handleAdClose = () => {
        setShowAd(false);
        if (hasNext) {
            goToNext();
        }
    };


    const handleEpisodeSelect = (episode: Episode) => {
        router.push(`/watch/${animeId}/${episode.slug}`);
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
                    <div className="aspect-video bg-muted flex items-center justify-center flex-col gap-4">
                        <p className="text-muted-foreground">No streams available</p>
                        <button onClick={fetchData} className="btn-outline">
                            Retry
                        </button>
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

            {/* Ad Layer 1 — After Controls */}
            <NativeAd set="A" className="my-2" />
            <BannerAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} className="justify-center" />

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

                    {/* Ad Layer 2 — Inside Episode List */}
                    <NativeAd set="B" className="my-2" />
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

            {/* Ad Layer 3 — Below Player */}
            <div className="bg-background">
                <div className="container mx-auto px-4 py-8 space-y-4">
                    <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90} className="hidden md:flex justify-center" />
                    <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />
                    <BannerAd adKey="dd5f08b2cef41d33b6c75282914cefd4" width={468} height={60} className="hidden sm:flex justify-center" />
                    <NativeAd set="A" className="my-2" />
                    <InFeedAd adKey="0184ead2c935ee466bea96058347d06d" width={300} height={250} />
                </div>
            </div>
        </div>
    );
}