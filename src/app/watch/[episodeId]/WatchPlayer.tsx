"use client";

import { useState } from "react";
import { SankaStreamServer } from "@/lib/sankaClient";
import { Play } from "lucide-react";

interface WatchPlayerProps {
    servers: SankaStreamServer[];
}

export default function WatchPlayer({ servers }: WatchPlayerProps) {
    const [activeServer, setActiveServer] = useState<SankaStreamServer | null>(
        servers.length > 0 ? servers[0] : null
    );

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
                {activeServer ? (
                    <iframe
                        src={activeServer.streamUrl}
                        className="w-full h-full border-0 absolute top-0 left-0"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Memuat video...
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
