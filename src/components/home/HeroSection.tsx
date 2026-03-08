"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { HeroFallback } from "./HeroFallback";

export interface Anime {
    id?: string;
    slug: string;
    title: string;
    image: string;
    episode?: string;
    rating?: string;
    type?: string[];
    description?: string;
}

export function HeroSection({ featured }: { featured: Anime | undefined }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>(featured?.image || '/placeholder-hero.svg');

    if (!featured) return <HeroFallback />;

    return (
        <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-muted">
            <div className="absolute inset-0">
                <Image
                    src={imgSrc}
                    alt={featured.title}
                    fill
                    className={`object-cover transition-opacity duration-1000 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    priority
                    sizes="100vw"
                    unoptimized
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgSrc('/placeholder-hero.svg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            <div className="relative h-full flex items-end">
                <div className="container mx-auto px-4 max-w-7xl pb-12">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                            {featured.title}
                        </h1>
                        {featured.description && (
                            <p className="text-sm md:text-base text-muted-foreground mb-6 line-clamp-3">
                                {featured.description}
                            </p>
                        )}
                        <div className="flex gap-4">
                            <Link
                                href={`/anime/${featured.id || featured.slug}`}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Play className="h-5 w-5 fill-current" />
                                Watch Now
                            </Link>
                            <Link
                                href={`/anime/${featured.id || featured.slug}`}
                                className="btn-outline inline-flex items-center gap-2"
                            >
                                More Info
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
