"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
    const [selectedQuality, setSelectedQuality] = useState<string>("");
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Find the best stream (prefer HLS/m3u8)
    const getStreamUrl = useCallback(() => {
        if (!streams || streams.length === 0) return null;

        // Try to find selected quality
        if (selectedQuality) {
            const stream = streams.find((s) => s.quality === selectedQuality);
            if (stream) return stream.url;
        }

        // Default: prefer 720p or highest available
        const preferred = streams.find(
            (s) => s.quality === "720p" || s.quality === "720"
        );
        if (preferred) return preferred.url;

        return streams[0]?.url;
    }, [streams, selectedQuality]);

    // Initialize video
    useEffect(() => {
        const video = videoRef.current;
        const streamUrl = getStreamUrl();

        if (!video || !streamUrl) {
            setError("No stream available");
            setIsLoading(false);
            return;
        }

        setError(null);
        setIsLoading(true);

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check if it's an HLS stream
        if (streamUrl.includes(".m3u8")) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hlsRef.current = hls;

                hls.loadSource(streamUrl);
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
                // Safari native HLS support
                video.src = streamUrl;
            }
        } else {
            // Regular MP4 or other format
            video.src = streamUrl;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [getStreamUrl, initialProgress, duration]);

    // Handle video events
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

    // Progress tracking
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

    // Auto-hide controls
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

    // Fullscreen handling
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
        <div
            ref={containerRef}
            className={cn(
                "video-container group",
                isFullscreen && "fixed inset-0 z-50"
            )}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                onClick={togglePlay}
            />

            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
            >
                {/* Top Bar */}
                <div className="absolute top-0 left-0 right-0 p-4">
                    <h3 className="text-white font-medium truncate">{title}</h3>
                    {episodeTitle && (
                        <p className="text-white/70 text-sm">{episodeTitle}</p>
                    )}
                </div>

                {/* Center Play Button */}
                <button
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center transition-all"
                >
                    {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                    ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                    )}
                </button>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    {/* Progress Bar */}
                    <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                        {/* Buffered */}
                        <div
                            className="absolute h-full bg-white/50"
                            style={{ width: `${(buffered / duration) * 100}%` }}
                        />
                        {/* Progress */}
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                            className="absolute h-full bg-primary"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Prev/Play/Next */}
                            <button
                                onClick={onPrev}
                                disabled={!hasPrev}
                                className="p-2 text-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SkipBack className="h-5 w-5" />
                            </button>
                            <button onClick={togglePlay} className="p-2 text-white hover:text-primary">
                                {isPlaying ? (
                                    <Pause className="h-6 w-6" />
                                ) : (
                                    <Play className="h-6 w-6" />
                                )}
                            </button>
                            <button
                                onClick={onNext}
                                disabled={!hasNext}
                                className="p-2 text-white hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SkipForward className="h-5 w-5" />
                            </button>

                            {/* Skip buttons */}
                            <button
                                onClick={() => skip(-10)}
                                className="p-2 text-white hover:text-primary text-xs"
                            >
                                -10s
                            </button>
                            <button
                                onClick={() => skip(10)}
                                className="p-2 text-white hover:text-primary text-xs"
                            >
                                +10s
                            </button>

                            {/* Time */}
                            <span className="text-white/80 text-sm ml-2">
                                {formatDuration(Math.floor(currentTime))} /{" "}
                                {formatDuration(Math.floor(duration))}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Volume */}
                            <div className="flex items-center gap-1 group/volume">
                                <button onClick={toggleMute} className="p-2 text-white hover:text-primary">
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-5 w-5" />
                                    ) : (
                                        <Volume2 className="h-5 w-5" />
                                    )}
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

                            {/* Settings */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 text-white hover:text-primary"
                                >
                                    <Settings className="h-5 w-5" />
                                </button>
                                {showSettings && (
                                    <div className="absolute bottom-full right-0 mb-2 glass-card p-2 min-w-[150px]">
                                        <p className="text-xs font-medium mb-2 px-2">Quality</p>
                                        {streams.map((stream) => (
                                            <button
                                                key={stream.quality}
                                                onClick={() => {
                                                    setSelectedQuality(stream.quality);
                                                    setShowSettings(false);
                                                }}
                                                className={cn(
                                                    "block w-full text-left px-2 py-1 text-sm rounded hover:bg-muted",
                                                    selectedQuality === stream.quality && "text-primary"
                                                )}
                                            >
                                                {stream.quality}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 text-white hover:text-primary"
                            >
                                {isFullscreen ? (
                                    <Minimize className="h-5 w-5" />
                                ) : (
                                    <Maximize className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
