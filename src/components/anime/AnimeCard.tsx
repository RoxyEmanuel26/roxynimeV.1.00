"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimeCardProps {
    id: string;
    slug?: string;
    title: string;
    image: string;
    episode?: string | number;
    rating?: number;
    type?: string | string[];
    className?: string;
}

export function AnimeCard({
    id,
    slug,
    title,
    image,
    episode,
    rating,
    type,
    className,
}: AnimeCardProps) {
    // Extract anime ID from slug if needed, fallback to id
    const animeId = id || (slug?.match(/\/anime\/(\d+)/)?.[1]) || slug || "";
    const href = `/anime/${animeId}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("group", className)}
        >
            <Link href={href} className="block">
                <div className="anime-card aspect-[3/4] relative">
                    {/* Poster Image */}
                    <Image
                        src={image || "/placeholder-anime.jpg"}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                    {/* Type Badge */}
                    {type && (
                        <div className="absolute top-2 left-2 z-20 flex gap-1">
                            {Array.isArray(type) ? type.slice(0, 2).map((t, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 text-[10px] font-medium rounded bg-primary/90 text-white"
                                >
                                    {t}
                                </span>
                            )) : (
                                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-primary/90 text-white">{type}</span>
                            )}
                        </div>
                    )}

                    {/* Rating Badge */}
                    {rating && rating > 0 && (
                        <div className="absolute top-2 right-2 z-20 rating-badge">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}

                    {/* Play Button on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg glow-hover">
                            <Play className="h-6 w-6 text-white fill-white ml-1" />
                        </div>
                    </div>

                    {/* Episode Info */}
                    {episode && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                            <span className="text-xs text-white/80">{episode}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="mt-2 font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
            </Link>
        </motion.div>
    );
}
