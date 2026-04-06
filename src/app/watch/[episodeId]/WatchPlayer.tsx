"use client";

import { useState, useEffect, useCallback } from "react";
import { SankaStreamServer } from "@/lib/sankaClient";
import { Play, Loader2, RefreshCw } from "lucide-react";

interface WatchPlayerProps {
    servers: SankaStreamServer[];
}

export default function WatchPlayer({ servers }: WatchPlayerProps) {
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

    if (!servers || servers.length === 0) {
        return (
            <div className="w-full aspect-video bg-black flex flex-col items-center justify-center text-white rounded-xl overflow-hidden ring-1 ring-border">
                <Play className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-xl font-bold">Video Tidak Tersedia</p>
                <p className="text-muted-foreground">Silakan coba lagi nanti atau pilih anime lain.</p>
            </div>
        );
    }

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
                    <iframe
                        src={resolvedUrl}
                        className="w-full h-full border-0 absolute top-0 left-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Pilih server untuk mulai menonton
                    </div>
                )}
            </div>

            {/* Server Selection */}
            <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pilih Server (Jika Video Error)</h3>
                <div className="flex flex-wrap gap-2">
                    {servers.map((server, idx) => {
                        const isActive = activeServer?.streamUrl === server.streamUrl;
                        return (
                            <button
                                key={`${server.name}-${idx}`}
                                onClick={() => setActiveServer(server)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                        ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-primary/50"}`} />
                                {server.name} {server.quality && server.quality !== "default" && server.quality !== "auto" ? `(${server.quality})` : ""}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
