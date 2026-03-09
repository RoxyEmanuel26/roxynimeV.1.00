"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
    Compass,
    Play,
    Film,
    Home,
    Sparkles,
} from "lucide-react";
import { BannerAd } from "../ads/BannerAd";
import { DataSaverToggle } from "@/components/common/DataSaverToggle";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/ongoing", label: "Ongoing", icon: Play },
    { href: "/movies", label: "Movies", icon: Film },
];

export function Header() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [announcementVisible, setAnnouncementVisible] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => setMounted(true), []);

    // Track scroll for header shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
            setMobileMenuOpen(false);
        }
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* 1. ANNOUNCEMENT BAR */}
            {announcementVisible && (
                <div className="w-full h-9 bg-gradient-to-r from-violet-900/80 via-blue-900/80 to-violet-900/80 flex items-center justify-center text-xs text-blue-200/80 border-b border-white/5 overflow-hidden relative z-50">
                    <div className="flex items-center gap-2 animate-pulse">
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                        <span>✨ Nonton Anime Sub Indo Gratis — Update Setiap Hari</span>
                        <Sparkles className="h-3 w-3 text-yellow-400" />
                    </div>
                    <button
                        onClick={() => setAnnouncementVisible(false)}
                        className="absolute right-3 text-white/40 hover:text-white/80 transition-colors"
                        aria-label="Close announcement"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            {/* 2. MAIN HEADER */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? "bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50" : "bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm"}`}>

                {/* Top Ad Banner */}
                <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90} className="hidden lg:flex" />

                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between h-16 gap-4">

                        {/* 3. LOGO */}
                        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 group">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-shadow duration-300">
                                    <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                                </div>
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-violet-300 transition-all duration-300" style={{ fontFamily: "var(--font-heading)" }}>
                                    RoxyNime
                                </span>
                                <span className="text-[9px] text-white/30 tracking-[0.2em] uppercase mt-0.5">
                                    Anime Streaming
                                </span>
                            </div>
                        </Link>

                        {/* 4. NAVIGATION LINKS */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {NAV_LINKS.map((link) => {
                                const Icon = link.icon;
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${active ? "text-cyan-400" : "text-white/60 hover:text-white"}`}
                                    >
                                        <span className={`absolute inset-0 rounded-lg transition-all duration-200 ${active ? "bg-cyan-500/10" : "bg-transparent group-hover:bg-white/5"}`} />
                                        <Icon className={`relative h-4 w-4 transition-colors ${active ? "text-cyan-400" : "text-white/40 group-hover:text-white/70"}`} />
                                        <span className="relative">{link.label}</span>
                                        {active && (
                                            <span className="relative ml-0.5 w-1 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/80" />
                                        )}
                                        <span className={`absolute bottom-0 left-3 right-3 h-px rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-300 origin-left ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* 5. SEARCH BAR */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-4">
                            <div className="relative w-full group">
                                <div className="absolute -inset-px rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500/30 to-violet-500/30 blur-sm" />
                                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl group-focus-within:border-cyan-500/50 transition-colors duration-300">
                                    <Search className="absolute left-3 h-4 w-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Cari anime..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent pl-10 pr-16 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
                                    />
                                    <div className="absolute right-3 flex items-center gap-1">
                                        <kbd className="hidden lg:inline-flex group-focus-within:hidden text-[10px] text-white/20 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-sans justify-center items-center">
                                            ⌘K
                                        </kbd>
                                        {searchQuery && (
                                            <button
                                                type="submit"
                                                className="text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                                            >
                                                Cari
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* RIGHT ACTIONS */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {/* 6. THEME TOGGLE */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200 group overflow-hidden"
                                    aria-label="Toggle theme"
                                >
                                    <div className="relative">
                                        <Sun className={`h-4 w-4 text-amber-400 absolute inset-0 transition-all duration-300 ${theme === "dark" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`} />
                                        <Moon className={`h-4 w-4 text-blue-300 transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} />
                                    </div>
                                </button>
                            )}

                            {/* 6.5 DATA SAVER TOGGLE */}
                            <DataSaverToggle />

                            {/* 7. SIGN IN / USER DROPDOWN */}
                            {session ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="relative w-9 h-9 rounded-full ring-2 ring-white/10 hover:ring-cyan-500/50 transition-all duration-300 overflow-hidden flex items-center justify-center bg-white/5"
                                    >
                                        {session.user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs text-white font-bold">
                                                {session.user.name?.[0] || <User className="h-4 w-4" />}
                                            </div>
                                        )}
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-56 bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                                <p className="font-semibold text-sm truncate text-white">{session.user.name}</p>
                                                <p className="text-xs text-white/50 truncate mt-0.5">{session.user.email}</p>
                                            </div>
                                            <div className="p-1">
                                                {[
                                                    { href: "/profile", icon: User, label: "Profile" },
                                                    { href: "/profile?tab=history", icon: History, label: "Watch History" },
                                                    { href: "/profile?tab=favorites", icon: Heart, label: "Favorites" },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors m-1"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <item.icon className="h-4 w-4 text-white/50" />
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="border-t border-white/10 p-1 mt-1">
                                                <button
                                                    onClick={() => signOut()}
                                                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors m-1"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/auth/signin"
                                    className="hidden sm:inline-flex relative items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                                >
                                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 group-hover:from-cyan-400 group-hover:to-violet-500 transition-colors duration-300" />
                                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out" />
                                    <User className="relative h-4 w-4" />
                                    <span className="relative">Sign In</span>
                                </Link>
                            )}

                            {/* Mobile Sidebar Toggle Button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200"
                                aria-label="Open menu"
                            >
                                <Menu className="h-4 w-4 text-white/80" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Glow line below header */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
            </header>

            {/* 8. MOBILE MENU (Slide-in sidebar) */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className={`fixed top-0 left-0 bottom-0 z-[70] w-72 max-w-[80vw] bg-gray-950/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Sidebar header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
                        </div>
                        <span className="font-bold text-base text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>RoxyNime</span>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-4 w-4 text-white/70" />
                    </button>
                </div>

                {/* Mobile Search */}
                <div className="p-4 border-b border-white/10 bg-white/[0.02]">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                            type="text"
                            placeholder="Cari anime..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
                        />
                    </form>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                    {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
                            >
                                <Icon className={`h-5 w-5 ${active ? "text-cyan-400" : "text-white/40"}`} />
                                {link.label}
                                {active && (
                                    <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile bottom actions */}
                <div className="p-4 border-t border-white/10 space-y-3 bg-white/[0.02]">
                    {session ? (
                        <>
                            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                {session.user.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full border border-white/10 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xs text-white font-bold shadow-inner">
                                        {session.user.name?.[0] || <User className="h-3 w-3" />}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-semibold truncate">{session.user.name}</p>
                                    <p className="text-xs text-white/40 truncate">{session.user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    signOut();
                                }}
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/auth/signin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow duration-300"
                        >
                            <User className="h-4 w-4" />
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}

