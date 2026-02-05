"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    SkipBack,
    SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

interface Stream {
    quality: string;
    url: string;
    type: string;
    name?: string;
}

interface VideoPlayerProps {
    streams: Stream[];
    title: string;
    episodeTitle?: string;
    onProgress?: (progress: number) => void;
    onEnded?: () => void;
    initialProgress?: number;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

export function VideoPlayer({
    streams,
    title,
    episodeTitle,
    onProgress,
    onEnded,
    initialProgress = 0,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedServer, setSelectedServer] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
    const [selectedStreamUrl, setSelectedStreamUrl] = useState<string | null>(null);

    // Group streams by server name (from stream.name field)
    const serverGroups = useMemo(() => {
        const groups = new Map<string, Stream[]>();

        streams.forEach((stream) => {
            const serverName = (stream.name || stream.quality || "default").toLowerCase().trim();

            if (!groups.has(serverName)) {
                groups.set(serverName, []);
            }
            groups.get(serverName)!.push(stream);
        });

        return groups;
    }, [streams]);

    const availableServers = useMemo(() => Array.from(serverGroups.keys()), [serverGroups]);

    const currentServerStreams = useMemo(() => {
        if (!selectedServer) return [];
        return serverGroups.get(selectedServer) || [];
    }, [selectedServer, serverGroups]);

    // Initialize default server and stream
    useEffect(() => {
        if (availableServers.length > 0 && !selectedServer) {
            const preferredOrder = ["vidhide", "ondesuhd", "updesu", "filedon", "mega", "odstream"];
            const firstServer = preferredOrder.find(s => availableServers.includes(s)) || availableServers[0];

            // Auto-select this server (will trigger handleServerClick logic via manual call)
            handleServerClick(firstServer);
        }
    }, [availableServers.length]);


    const handleServerClick = async (serverName: string) => {
        setSelectedServer(serverName);

        const serverStreams = serverGroups.get(serverName) || [];

        if (serverStreams.length > 0) {
            // Sort by quality - lowest first (360p < 480p < 720p < 1080p)
            const sortedStreams = [...serverStreams].sort((a, b) => {
                const getQualityNumber = (quality: string) => {
                    const match = quality.match(/(\d+)/);
                    return match ? parseInt(match[1]) : 999;
                };

                return getQualityNumber(a.quality) - getQualityNumber(b.quality);
            });

            const lowestQuality = sortedStreams[0];

            console.log(`🎯 Auto-selecting lowest quality for ${serverName}:`, lowestQuality.quality);

            setSelectedQuality(lowestQuality.quality);

            // Resolve stream URL
            setIsLoading(true);

            if (lowestQuality.url.includes("/anime/server/")) {
                const serverIdMatch = lowestQuality.url.match(/\/anime\/server\/([^/]+)/);
                if (serverIdMatch) {
                    const serverId = serverIdMatch[1];

                    try {
                        const response = await fetch(`/api/server/${serverId}`);
                        if (response.ok) {
                            const data = await response.json();
                            setSelectedStreamUrl(data.url);
                        } else {
                            setSelectedStreamUrl(lowestQuality.url);
                        }
                    } catch (error) {
                        console.error("Error resolving stream:", error);
                        setSelectedStreamUrl(lowestQuality.url);
                    }
                } else {
                    setSelectedStreamUrl(lowestQuality.url);
                }
            } else {
                setSelectedStreamUrl(lowestQuality.url);
            }

            setIsLoading(false);
        }
    };


    const handleQualityClick = async (stream: Stream) => {
        setSelectedQuality(stream.quality);
        setIsLoading(true);

        console.log("🎬 Resolving stream URL:", stream.url);

        // Check if URL is a Sanka server endpoint that needs resolution
        if (stream.url.includes("/anime/server/")) {
            try {
                // Extract server ID from URL
                const serverIdMatch = stream.url.match(/\/anime\/server\/([^/]+)/);
                if (serverIdMatch) {
                    const serverId = serverIdMatch[1];
                    console.log("🔍 Resolving server ID:", serverId);

                    // Call our API to resolve the server URL
                    const response = await fetch(`/api/server/${serverId}`);

                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ Resolved URL:", data.url);
                        setSelectedStreamUrl(data.url);
                    } else {
                        console.error("❌ Failed to resolve server URL");
                        // Fallback to original URL (will be iframe)
                        setSelectedStreamUrl(stream.url);
                    }
                } else {
                    setSelectedStreamUrl(stream.url);
                }
            } catch (error) {
                console.error("Error resolving stream:", error);
                setSelectedStreamUrl(stream.url);
            }
        } else {
            // Direct URL, use as-is
            setSelectedStreamUrl(stream.url);
        }

        setIsLoading(false);
    };


    const getServerDisplayName = (serverName: string) => {
        const names: Record<string, string> = {
            "ondesuhd": "OndesuHD",
            "updesu": "Updesu",
            "vidhide": "Vidhide",
            "filedon": "Filedon",
            "mega": "Mega",
            "odstream": "ODstream"
        };
        return names[serverName] || serverName.charAt(0).toUpperCase() + serverName.slice(1);
    };

    // Initialize video
    useEffect(() => {
        if (selectedStreamUrl) {
            setIsLoading(true);
        }
    }, [selectedStreamUrl]);


    // Video event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setIsLoading(false);
        };
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };
        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("ended", handleEnded);
        };
    }, [onEnded]);

    useEffect(() => {
        if (onProgress && duration > 0) {
            progressInterval.current = setInterval(() => {
                const progress = (currentTime / duration) * 100;
                onProgress(progress);
            }, 5000);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [currentTime, duration, onProgress]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            if (isPlaying) {
                timeout = setTimeout(() => setShowControls(false), 3000);
            }
        };

        const container = containerRef.current;
        container?.addEventListener("mousemove", handleMouseMove);

        return () => {
            container?.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeout);
        };
    }, [isPlaying]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const toggleFullscreen = async () => {
        const container = containerRef.current;
        if (!container) return;
        if (isFullscreen) {
            await document.exitFullscreen();
        } else {
            await container.requestFullscreen();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const time = parseFloat(e.target.value);
        video.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const vol = parseFloat(e.target.value);
        video.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    };

    if (error) {
        return (
            <div className="video-container flex items-center justify-center">
                <div className="text-center text-white">
                    <p className="text-lg font-medium">{error}</p>
                    <p className="text-sm text-white/60 mt-2">
                        Please try a different source or refresh the page
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                ref={containerRef}
                className={cn(
                    "video-container group relative",
                    isFullscreen && "fixed inset-0 z-50"
                )}
            >
                <iframe
                    src={selectedStreamUrl || undefined}
                    className="w-full h-full bg-black"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onLoad={() => {
                        setIsLoading(false);
                        setIsPlaying(true);
                    }}
                />


                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Title Overlay - Only show on hover */}
                <div
                    className={cn(
                        "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 pointer-events-none",
                        showControls ? "opacity-100" : "opacity-0"
                    )}
                >
                    <h3 className="text-white font-medium truncate">{title}</h3>
                    {episodeTitle && <p className="text-white/70 text-sm">{episodeTitle}</p>}
                </div>

            </div>

            {/* SERVER SELECTOR */}
            <div className="bg-card border-t border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-3">
                                Pilih Server:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableServers.map((serverName) => (
                                    <button
                                        key={`srv-${serverName}`}
                                        onClick={() => handleServerClick(serverName)}
                                        className={cn(
                                            "px-6 py-3 rounded-lg font-medium transition-all text-sm",
                                            selectedServer === serverName
                                                ? "bg-primary text-white shadow-lg"
                                                : "bg-muted hover:bg-muted/80 text-foreground"
                                        )}
                                    >
                                        {getServerDisplayName(serverName)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedServer && currentServerStreams.length > 0 && (
                            <div className="bg-muted/30 rounded-lg p-4">
                                <div className="text-sm font-medium mb-3">
                                    Pilih Quality ({getServerDisplayName(selectedServer)}):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentServerStreams.map((stream, idx) => (
                                        <button
                                            key={`q-${selectedServer}-${stream.quality}-${idx}`}
                                            onClick={() => handleQualityClick(stream)}
                                            className={cn(
                                                "px-4 py-2 rounded-md font-medium transition-all text-sm",
                                                selectedQuality === stream.quality  // ✅ 'stream' available here
                                                    ? "bg-primary text-white shadow-md"
                                                    : "bg-background hover:bg-muted text-foreground border border-border"
                                            )}
                                        >
                                            {stream.quality}
                                        </button>
                                    ))}

                                </div>
                            </div>
                        )}

                        {selectedServer && selectedQuality && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Currently Playing:</span>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                    {getServerDisplayName(selectedServer)} - {selectedQuality}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

