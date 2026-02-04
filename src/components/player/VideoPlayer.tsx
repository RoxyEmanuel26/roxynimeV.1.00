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
    const [selectedStreamUrl, setSelectedStreamUrl] = useState<string>("");

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

            setSelectedServer(firstServer);

            const firstStream = serverGroups.get(firstServer)?.[0];
            if (firstStream) {
                setSelectedQuality(firstStream.quality);
                setSelectedStreamUrl(firstStream.url);
            }
        }
    }, [availableServers.length]);

    const handleServerClick = (serverName: string) => {
        setSelectedServer(serverName);

        const firstStream = serverGroups.get(serverName)?.[0];
        if (firstStream) {
            setSelectedQuality(firstStream.quality);
            setSelectedStreamUrl(firstStream.url);
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
        const video = videoRef.current;

        if (!video || !selectedStreamUrl) {
            return;
        }

        setError(null);
        setIsLoading(true);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (selectedStreamUrl.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsRef.current = hls;

                hls.loadSource(selectedStreamUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    if (initialProgress > 0 && duration > 0) {
                        video.currentTime = (initialProgress / 100) * duration;
                    }
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        setError("Failed to load video");
                        setIsLoading(false);
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = selectedStreamUrl;
            }
        } else {
            video.src = selectedStreamUrl;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [selectedStreamUrl, initialProgress, duration]);

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
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain bg-black"
                    playsInline
                    onClick={togglePlay}
                />

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div
                    className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
                        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    <div className="absolute top-0 left-0 right-0 p-4">
                        <h3 className="text-white font-medium truncate">{title}</h3>
                        {episodeTitle && <p className="text-white/70 text-sm">{episodeTitle}</p>}
                    </div>

                    <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-all"
                    >
                        {isPlaying ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white ml-1" />}
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                        <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                            <div className="absolute h-full bg-white/50" style={{ width: `${(buffered / duration) * 100}%` }} />
                            <input
                                type="range"
                                min={0}
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="absolute h-full bg-primary" style={{ width: `${(currentTime / duration) * 100}%` }} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={onPrev} disabled={!hasPrev} className="p-2 text-white hover:text-primary disabled:opacity-50">
                                    <SkipBack className="h-5 w-5" />
                                </button>
                                <button onClick={togglePlay} className="p-2 text-white hover:text-primary">
                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </button>
                                <button onClick={onNext} disabled={!hasNext} className="p-2 text-white hover:text-primary disabled:opacity-50">
                                    <SkipForward className="h-5 w-5" />
                                </button>
                                <button onClick={() => skip(10)} className="p-2 text-white hover:text-primary text-xs">+10s</button>
                                <span className="text-white/80 text-sm ml-2">
                                    {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 group/volume">
                                    <button onClick={toggleMute} className="p-2 text-white hover:text-primary">
                                        {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
                                    />
                                </div>

                                <div className="relative">
                                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-white hover:text-primary">
                                        <Settings className="h-5 w-5" />
                                    </button>
                                    {showSettings && (
                                        <div className="absolute bottom-full right-0 mb-2 glass-card p-2 min-w-[150px]">
                                            <p className="text-xs font-medium mb-2 px-2">Quick Settings</p>
                                            <button onClick={() => setShowSettings(false)} className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-muted">
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={toggleFullscreen} className="p-2 text-white hover:text-primary">
                                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
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
                                                selectedQuality === stream.quality && selectedStreamUrl === stream.url
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

