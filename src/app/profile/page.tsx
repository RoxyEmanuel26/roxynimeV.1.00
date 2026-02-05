"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, History, Heart, Settings, Play, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchHistoryItem {
    id: string;
    animeId: string;
    title: string;
    image: string;
    episode: number;
    progress: number;
    watchedAt: string;
}

interface FavoriteItem {
    id: string;
    animeId: string;
    title: string;
    image: string;
    createdAt: string;
}

// Loading fallback
function ProfileLoading() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

// Main wrapper with Suspense
export default function ProfilePage() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <ProfileContent />
        </Suspense>
    );
}

// Actual content
function ProfileContent() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "history");
    const [history, setHistory] = useState<WatchHistoryItem[]>([]);
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin?callbackUrl=/profile");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user) return;

            try {
                setLoading(true);

                // Fetch watch history
                const historyRes = await fetch("/api/history");
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setHistory(historyData.data || []);
                }

                // Fetch favorites
                const favoritesRes = await fetch("/api/favorites");
                if (favoritesRes.ok) {
                    const favoritesData = await favoritesRes.json();
                    setFavorites(favoritesData.data || []);
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.replace(`/profile?tab=${tab}`, { scroll: false });
    };

    const handleDeleteHistory = async (id: string) => {
        try {
            await fetch(`/api/history/${id}`, { method: "DELETE" });
            setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting history:", error);
        }
    };

    const handleRemoveFavorite = async (id: string) => {
        try {
            await fetch(`/api/favorites/${id}`, { method: "DELETE" });
            setFavorites((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const tabs = [
        { id: "history", label: "Watch History", icon: History },
        { id: "favorites", label: "Favorites", icon: Heart },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="glass-card p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {session.user.image ? (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={80}
                            height={80}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                    )}
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{session.user.name}</h1>
                        <p className="text-muted-foreground">{session.user.email}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Watch History */}
                    {activeTab === "history" && (
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No watch history yet</p>
                                    <Link href="/browse" className="btn-primary mt-4 inline-flex">
                                        Start Watching
                                    </Link>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="glass-card p-4 flex items-center gap-4"
                                    >
                                        <Link
                                            href={`/anime/${item.animeId}`}
                                            className="flex-shrink-0"
                                        >
                                            <Image
                                                src={item.image || "/placeholder-anime.jpg"}
                                                alt={item.title}
                                                width={200}
                                                height={300}
                                                className="rounded object-cover"
                                                sizes="200px"
                                            />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/anime/${item.animeId}`}
                                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {item.title}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                Episode {item.episode}
                                            </p>
                                            <div className="mt-2">
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${item.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {Math.round(item.progress)}% watched
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/watch/${item.animeId}/${item.episode}`}
                                                className="btn-primary p-2"
                                            >
                                                <Play className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteHistory(item.id)}
                                                className="btn-ghost p-2 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Favorites */}
                    {activeTab === "favorites" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {favorites.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No favorites yet</p>
                                    <Link href="/browse" className="btn-primary mt-4 inline-flex">
                                        Browse Anime
                                    </Link>
                                </div>
                            ) : (
                                favorites.map((item) => (
                                    <div key={item.id} className="group relative">
                                        <Link href={`/anime/${item.animeId}`}>
                                            <div className="aspect-[3/4] rounded-xl overflow-hidden relative">
                                                <Image
                                                    src={item.image || "/placeholder-anime.jpg"}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    unoptimized
                                                />
                                            </div>
                                            <h3 className="mt-2 font-medium text-sm line-clamp-2">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveFavorite(item.id)}
                                            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Settings */}
                    {activeTab === "settings" && (
                        <div className="glass-card p-6 max-w-md">
                            <h2 className="font-semibold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        defaultValue={session.user.name || ""}
                                        className="input"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        defaultValue={session.user.email || ""}
                                        className="input"
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Account settings are managed by your login provider.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
