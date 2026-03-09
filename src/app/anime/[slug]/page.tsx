import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { sankaClient } from "@/lib/sankaClient";
import { Play, Calendar, Star, Film, Clock, ChevronRight } from "lucide-react";
import { BannerAd, InFeedAd, SidebarAd } from "@/components/ads";
import { getBlurDataURL } from "@/lib/utils";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    try {
        const anime = await sankaClient.getDetail(slug);
        return {
            title: `${anime.title} Sub Indo — RoxyNime`,
            description: anime.synopsis?.slice(0, 160) || `Nonton anime ${anime.title} subtitle Indonesia gratis di RoxyNime.`,
            openGraph: {
                title: `${anime.title} Sub Indo — RoxyNime`,
                description: anime.synopsis?.slice(0, 160) || `Nonton anime ${anime.title} subtitle Indonesia gratis di RoxyNime.`,
                images: [anime.poster],
            },
        };
    } catch (error) {
        return {
            title: "Anime Not Found — RoxyNime",
        };
    }
}

export default async function AnimeDetailPage({ params }: PageProps) {
    const { slug } = await params;

    let anime;
    try {
        anime = await sankaClient.getDetail(slug);
    } catch (error) {
        notFound();
    }

    const { title, poster, synopsis, genres, type, status, totalEpisodes, rating, releaseDate, studio, episodes } = anime;

    return (
        <div className="min-h-screen pb-12">
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 max-w-7xl h-12 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <Link href="/browse" className="hover:text-primary transition-colors">Anime</Link>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="text-foreground font-medium truncate">{title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-6 max-w-7xl">
                <BannerAd adKey="1d4f1463e95b8d3fb84adadeb3a2f170" width={728} height={90} className="mb-6 hidden md:flex" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">

                        {/* Top Detail Section */}
                        <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 bg-card rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-border">
                            {/* Poster */}
                            <div className="w-[200px] h-[280px] sm:w-[240px] sm:h-[340px] shrink-0 mx-auto sm:mx-0 relative rounded-xl overflow-hidden shadow-lg ring-1 ring-border">
                                <Image
                                    src={poster || "/placeholder-anime.svg"}
                                    alt={title}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 640px) 200px, 240px"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL(240, 340)}
                                />

                                {/* Status Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-md shadow-sm backdrop-blur-md text-white uppercase tracking-wider
                    ${status?.toLowerCase().includes("ongoing") ? "bg-blue-600/90"
                                            : status?.toLowerCase().includes("complete") ? "bg-emerald-600/90"
                                                : "bg-black/60"}`}>
                                        {status}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-5">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-2 text-foreground">
                                        {title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        {type && (
                                            <div className="flex items-center gap-1.5 font-medium px-2.5 py-1 bg-muted rounded-md text-foreground">
                                                <Film className="w-4 h-4" />
                                                {type}
                                            </div>
                                        )}
                                        {rating && (
                                            <div className="flex items-center gap-1.5 text-amber-500 font-medium">
                                                <Star className="w-4 h-4 fill-amber-500" />
                                                {rating}
                                            </div>
                                        )}
                                        {releaseDate && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {releaseDate}
                                            </div>
                                        )}
                                        {totalEpisodes ? (
                                            <div className="flex items-center gap-1.5">
                                                <Play className="w-4 h-4" />
                                                {totalEpisodes} Eps
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Genres */}
                                    {genres && genres.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {genres.map(g => (
                                                <Link
                                                    key={g}
                                                    href={`/browse?genre=${encodeURIComponent(g)}`}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                                >
                                                    {g}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Meta Details */}
                                    {studio && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Studio: </span>
                                            <span className="font-medium text-foreground">{studio}</span>
                                        </div>
                                    )}

                                    <hr className="border-border" />

                                    {/* Synopsis */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Sinopsis</h3>
                                        <div className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                            {synopsis || "Sinopsis belum tersedia untuk anime ini."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <InFeedAd adKey="4c1772859ec58ab31d3e31f5a867698e" width={300} height={250} />

                        {/* Episode List Section */}
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Daftar Episode</h2>
                                    <p className="text-muted-foreground mt-1">Nonton streaming {title} sub indo</p>
                                </div>
                                {episodes && episodes.length > 0 && (
                                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                                        {episodes.length} Episode
                                    </div>
                                )}
                            </div>

                            {episodes && episodes.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {episodes.map((ep, index) => {
                                        const isLatest = index === 0 && status?.toLowerCase().includes("ongoing");

                                        return (
                                            <Link
                                                key={ep.id}
                                                href={`/watch/${ep.urlSlug}`}
                                                className="group flex flex-col justify-center p-4 rounded-xl border border-border bg-background hover:border-primary hover:shadow-md hover:bg-primary/5 transition-all relative overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-lg group-hover:text-primary transition-colors">
                                                        Episode {ep.number}
                                                    </span>
                                                    <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:fill-primary/20 transition-colors" />
                                                </div>

                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-xs text-muted-foreground truncate pr-2">
                                                        {ep.title || `Episode ${ep.number}`}
                                                    </span>
                                                    {ep.date && (
                                                        <span className="text-[10px] text-muted-foreground/70 shrink-0 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {ep.date}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* New Episode Indicator */}
                                                {isLatest && (
                                                    <div className="absolute top-0 right-0">
                                                        <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                                            NEW
                                                        </div>
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Film className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Belum Ada Episode</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">
                                        Video episode untuk anime ini belum tersedia. Silakan cek kembali nanti atau coba server lain.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Sidebar Area */}
                    <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <SidebarAd className="sticky top-24" />
                    </aside>
                </div>

                <BannerAd adKey="dd5f08b2cef41d33b6c75282914cefd4" width={468} height={60} className="mt-8 hidden sm:flex" />
            </div>
        </div>
    );
}
