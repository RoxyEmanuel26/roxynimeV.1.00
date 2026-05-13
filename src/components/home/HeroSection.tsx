"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { AdLink } from "@/components/ads/AdLink";
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
    _source?: string;
    status?: string;
}

export function HeroSection({ featured }: { featured: Anime | undefined }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState<string>(featured?.image || '/placeholder-hero.svg');

    if (!featured) return <HeroFallback />;

    return (
        <section className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-background">
            {/* Background Layer: Blurred and Darkened */}
            <div className="absolute inset-0">
                <Image
                    src={imgSrc}
                    alt={featured.title}
                    fill
                    className={`object-cover blur-2xl scale-125 transition-opacity duration-1000 ${imageLoaded ? "opacity-30 dark:opacity-20" : "opacity-0"}`}
                    priority
                    sizes="100vw"
                    unoptimized
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgSrc('/placeholder-hero.svg')}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Foreground Content */}
            <div className="relative w-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-24 pb-12 lg:pt-32 lg:pb-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">

                    {/* Left Side: Text Area */}
                    <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center">
                        {featured.episode && (
                            <span className="inline-block px-3 py-1 mb-4 text-xs sm:text-sm font-semibold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit animate-fade-in-up">
                                {String(featured.episode).toLowerCase().includes('ep') ? featured.episode : `Episode ${featured.episode}`}
                            </span>
                        )}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-100" style={{ fontFamily: "var(--font-heading)" }}>
                            {featured.title}
                        </h1>
                        {featured.description && (
                            <p className="text-base sm:text-lg text-muted-foreground mb-8 line-clamp-3 sm:line-clamp-4 max-w-2xl animate-fade-in-up delay-200">
                                {featured.description}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-3 sm:gap-4 animate-fade-in-up delay-300">
                            <AdLink
                                href={`/anime/${featured.id || featured.slug}${featured._source ? `?source=${featured._source}` : ''}`}
                                adKey={`hero-watch-${featured.id || featured.slug}`}
                                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                            >
                                <Play className="h-5 w-5 fill-current" />
                                Watch Now
                            </AdLink>
                            <Link
                                href={`/anime/${featured.id || featured.slug}${featured._source ? `?source=${featured._source}` : ''}`}
                                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-300"
                            >
                                More Info
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: Crisp Poster Image (Hidden on very small mobile, visible on sm+) */}
                    <div className="hidden sm:flex md:col-span-5 lg:col-span-5 justify-center lg:justify-end items-center animate-fade-in-up delay-300 mt-8 md:mt-0">
                        <div className="relative w-[200px] md:w-[240px] lg:w-[280px] xl:w-[320px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.3)] ring-1 ring-white/10 group transform transition-transform duration-700 hover:scale-105 hover:-rotate-2">
                            <Image
                                src={imgSrc}
                                alt={featured.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 200px, (max-width: 1024px) 240px, (max-width: 1280px) 280px, 320px"
                                unoptimized
                            />
                            {/* Shine effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            {/* Inner ring */}
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
