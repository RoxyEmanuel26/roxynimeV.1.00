"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Menu,
    X,
    Sun,
    Moon,
    User,
    LogOut,
    Heart,
    History,
    ChevronDown,
} from "lucide-react";
import { BannerAd } from "../ads/BannerAd";

export function Header() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileMenuOpen(false);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* Top Ad Banner */}
            <BannerAd className="hidden lg:flex" />

            {/* Main Header */}
            <div className="bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-lg animate-pulse" />
                                <div className="absolute inset-0.5 bg-background rounded-lg flex items-center justify-center">
                                    <span className="text-xl font-bold gradient-text">R</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold hidden sm:block">
                                <span className="gradient-text">Roxy</span>
                                <span className="text-foreground">Nime</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                                Home
                            </Link>
                            <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
                                Browse
                            </Link>
                            <Link href="/ongoing" className="text-sm font-medium hover:text-primary transition-colors">
                                Ongoing
                            </Link>
                            <Link href="/movies" className="text-sm font-medium hover:text-primary transition-colors">
                                Movies
                            </Link>
                        </nav>

                        {/* Search Bar - Desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-6">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search anime..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input pl-10 h-10"
                                />
                            </div>
                        </form>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="btn-ghost p-2 rounded-lg"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-5 w-5" />
                                    ) : (
                                        <Moon className="h-5 w-5" />
                                    )}
                                </button>
                            )}

                            {/* User Menu */}
                            {session ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 btn-ghost p-1.5 rounded-lg"
                                    >
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                        <ChevronDown className="h-4 w-4 hidden sm:block" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-lg">
                                            <div className="px-4 py-2 border-b border-border">
                                                <p className="font-medium truncate">{session.user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                            <Link
                                                href="/profile?tab=history"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <History className="h-4 w-4" />
                                                Watch History
                                            </Link>
                                            <Link
                                                href="/profile?tab=favorites"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Heart className="h-4 w-4" />
                                                Favorites
                                            </Link>
                                            <button
                                                onClick={() => signOut()}
                                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-muted transition-colors text-destructive"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/auth/signin" className="btn-primary text-sm">
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden btn-ghost p-2 rounded-lg"
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background">
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search anime..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input pl-10"
                                    />
                                </div>
                            </form>

                            {/* Mobile Nav Links */}
                            <nav className="flex flex-col gap-2">
                                <Link
                                    href="/"
                                    className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/browse"
                                    className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Browse
                                </Link>
                                <Link
                                    href="/ongoing"
                                    className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Ongoing
                                </Link>
                                <Link
                                    href="/movies"
                                    className="px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Movies
                                </Link>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
