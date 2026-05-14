"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { SankaStreamServer } from "@/lib/sankaClient";
import { Play, Loader2, RefreshCw, Server, CheckCircle2, Info } from "lucide-react";

/**
 * Detect if a URL points to a direct video file (not embeddable in iframe).
 * These need to be played with a <video> tag instead.
 */
function isDirectVideoUrl(url: string): boolean {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".m3u8", ".mkv", ".avi"];
    const urlLower = url.toLowerCase().split("?")[0].split("#")[0];
    return videoExtensions.some(ext => urlLower.endsWith(ext));
}

interface WatchPlayerProps {
    servers: SankaStreamServer[];
    animeId?: string;
    currentEpisode?: number;
    animeTitle?: string;
    animeImage?: string;
}

export default function WatchPlayer({ 
    servers,
    animeId,
    currentEpisode = 1,
    animeTitle,
    animeImage
}: WatchPlayerProps) {
    const { data: session } = useSession();
    const [activeServer, setActiveServer] = useState<SankaStreamServer | null>(
        servers.length > 0 ? servers[0] : null
    );
    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
    const [resolving, setResolving] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    /**
     * Resolve a server's streamUrl.
     *
     * Some streamUrls point directly to an iframe-embeddable page (e.g. desustream).
     * Others point to a Sanka API endpoint (/anime/server/...) that returns JSON
     * with the actual embed URL in `data.url`.
     *
     * This function handles both cases.
     */
    const resolveStreamUrl = useCallback(async (server: SankaStreamServer) => {
        const url = server.streamUrl;
        if (!url) {
            setResolveError("URL server tidak tersedia");
            return;
        }

        setResolving(true);
        setResolveError(null);
        setResolvedUrl(null);

        try {
            // If the URL is NOT a Sanka API endpoint, use it directly
            const isSankaEndpoint =
                url.includes("/anime/server/") ||
                url.includes("/api/streaming/") ||
                url.includes("sankavollerei.com/anime/");

            if (!isSankaEndpoint) {
                // Direct embeddable URL (e.g., desustream, vidhide, filedon, etc.)
                setResolvedUrl(url);
                setResolving(false);
                return;
            }

            // Fetch the Sanka server endpoint to get the actual embed URL
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const contentType = res.headers.get("content-type") || "";

            // If the response is JSON, extract the URL
            if (contentType.includes("application/json")) {
                const json = await res.json();

                // Check various possible structures
                const embedUrl =
                    json.data?.url ||
                    json.data?.streamUrl ||
                    json.data?.embed ||
                    json.data?.iframe ||
                    json.url ||
                    json.streamUrl ||
                    json.embed;

                if (embedUrl) {
                    setResolvedUrl(embedUrl);
                } else {
                    console.error("[WatchPlayer] Could not extract URL from JSON:", json);
                    throw new Error("Tidak dapat menemukan URL video dari server");
                }
            } else {
                // Response is not JSON (it's HTML/embeddable content)
                // Use the URL directly as iframe source
                setResolvedUrl(url);
            }
        } catch (err) {
            console.error("[WatchPlayer] Error resolving stream URL:", err);
            setResolveError(
                err instanceof Error ? err.message : "Gagal memuat video, coba server lain"
            );
        } finally {
            setResolving(false);
        }
    }, []);

    // Resolve URL whenever the active server changes
    useEffect(() => {
        if (activeServer) {
            resolveStreamUrl(activeServer);
        }
    }, [activeServer, resolveStreamUrl]);

    // Save watch progress
    useEffect(() => {
        if (!session?.user?.id || !animeId || !resolvedUrl) return;

        const saveHistory = async () => {
            try {
                await fetch("/api/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        animeId,
                        episode: currentEpisode,
                        progress: 0, // Mark as started
                        title: animeTitle || "",
                        image: animeImage || "",
                    }),
                });
            } catch (err) {
                console.error("Failed to save history:", err);
            }
        };

        saveHistory();
    }, [session?.user?.id, animeId, currentEpisode, resolvedUrl, animeTitle, animeImage]);

    if (!servers || servers.length === 0) {
        return (
            <div className="w-full aspect-video bg-black flex flex-col items-center justify-center text-white rounded-xl overflow-hidden ring-1 ring-border">
                <Play className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-xl font-bold">Video Tidak Tersedia</p>
                <p className="text-muted-foreground">Silakan coba lagi nanti atau pilih anime lain.</p>
            </div>
        );
    }

    // Group servers by quality
    const groupedServers = servers.reduce((acc, server) => {
        const quality = server.quality && server.quality !== "default" && server.quality !== "auto" ? server.quality.toUpperCase() : "AUTO";
        if (!acc[quality]) acc[quality] = [];
        acc[quality].push(server);
        return acc;
    }, {} as Record<string, SankaStreamServer[]>);

    // Sort qualities: numerical values first (e.g., 360P, 480P, 720P, 1080P), then AUTO
    const sortedQualities = Object.keys(groupedServers).sort((a, b) => {
        if (a === "AUTO") return 1;
        if (b === "AUTO") return -1;
        const aNum = parseInt(a.replace(/\D/g, "")) || 0;
        const bNum = parseInt(b.replace(/\D/g, "")) || 0;
        return aNum - bNum;
    });

    return (
        <div className="space-y-6">
            {/* Video Player (iframe) */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl ring-1 ring-border relative">
                {resolving ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Memuat video...</p>
                    </div>
                ) : resolveError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4 px-4">
                        <p className="text-red-400 text-center">{resolveError}</p>
                        <button
                            onClick={() => activeServer && resolveStreamUrl(activeServer)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                        <p className="text-xs text-muted-foreground text-center">
                            Atau pilih server lain di bawah
                        </p>
                    </div>
                ) : resolvedUrl ? (
                    isDirectVideoUrl(resolvedUrl) ? (
                        <video
                            src={resolvedUrl}
                            className="w-full h-full absolute top-0 left-0 bg-black"
                            controls
                            autoPlay
                            playsInline
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <iframe
                            src={resolvedUrl}
                            className="w-full h-full border-0 absolute top-0 left-0"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pilih server untuk mulai menonton
                    </div>
                )}
            </div>

            {/* Server Selection */}
            <div className="bg-card/50 p-4 sm:p-6 rounded-xl border border-border/50">
                <div className="w-full bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 mb-6 flex flex-col items-center justify-center text-center gap-2 shadow-sm">
                    <span className="text-3xl mb-1">⚠️</span>
                    <span className="text-base sm:text-lg font-bold">
                        Pilih server lain jika video mengalami error atau tidak bisa diputar
                    </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start mb-6">
                    <h3 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Server className="w-5 h-5 text-primary" />
                        Daftar Server ({servers.length})
                    </h3>
                </div>
                
                <div className="space-y-6">
                    {sortedQualities.map((quality) => (
                        <div key={quality} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <h4 className="text-sm font-bold text-primary uppercase tracking-widest">{quality}</h4>
                                <div className="h-px bg-border/80 flex-1" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groupedServers[quality].map((server, idx) => {
                                    const isActive = activeServer?.streamUrl === server.streamUrl;
                                    
                                    return (
                                        <button
                                            key={`${server.name}-${idx}`}
                                            onClick={() => setActiveServer(server)}
                                            className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 text-left ${
                                                isActive 
                                                    ? "bg-primary/10 border-primary/50 shadow-sm shadow-primary/5" 
                                                    : "bg-background border-border hover:bg-muted/80 hover:border-muted-foreground/30"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`p-2.5 rounded-lg transition-colors ${
                                                    isActive 
                                                        ? "bg-primary text-primary-foreground shadow-sm" 
                                                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                }`}>
                                                    <Play className="w-4 h-4 fill-current" />
                                                </div>
                                                <div>
                                                    <p className={`font-semibold leading-none mb-1.5 transition-colors ${
                                                        isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                                                    }`}>
                                                        {server.name}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-[11px] uppercase font-bold tracking-wider">
                                                        <span className="text-muted-foreground/70">Resolusi</span>
                                                        <span className="text-muted-foreground/40">•</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                            isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                                        }`}>
                                                            {quality}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pl-4 pr-1">
                                                {isActive ? (
                                                    <div className="flex items-center gap-1.5 text-primary">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">Diputar</span>
                                                        <CheckCircle2 className="w-5 h-5 drop-shadow-sm" />
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
