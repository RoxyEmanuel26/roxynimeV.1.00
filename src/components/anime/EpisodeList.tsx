"use client";

import { Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Episode {
    id: string;
    number: number;
    title?: string;
    slug: string;
}

interface EpisodeListProps {
    episodes: Episode[];
    currentEpisode?: number;
    onSelect: (episode: Episode) => void;
    className?: string;
}

export function EpisodeList({
    episodes,
    currentEpisode,
    onSelect,
    className,
}: EpisodeListProps) {
    if (!episodes || episodes.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No episodes available
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            {episodes.map((episode) => {
                const isActive = episode.number === currentEpisode;
                const isLocked = false; // Future: implement premium content

                return (
                    <button
                        key={episode.id}
                        onClick={() => !isLocked && onSelect(episode)}
                        disabled={isLocked}
                        className={cn(
                            "episode-card w-full text-left",
                            isActive && "active",
                            isLocked && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div
                            className={cn(
                                "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            )}
                        >
                            {isLocked ? (
                                <Lock className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">Episode {episode.number}</p>
                            {episode.title && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {episode.title}
                                </p>
                            )}
                        </div>
                        {isActive && (
                            <span className="text-xs text-primary font-medium">
                                Now Playing
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
