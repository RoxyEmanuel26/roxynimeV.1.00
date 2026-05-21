"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    Search,
    Menu,
    X,
    Sun,
    Moon,
    Compass,
    Play,
    Film,
    Home,
    Sparkles,
    Calendar,
} from "lucide-react";

const NAV_LINKS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/ongoing", label: "Ongoing", icon: Play },
    { href: "/movies", label: "Movies", icon: Film },
    { href: "/schedule", label: "Jadwal", icon: Calendar },
];

export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [announcementVisible, setAnnouncementVisible] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    // Track scroll for header shadow
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);



    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Hide mobile keyboard by blurring the active input element
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

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

                <div className="container mx-auto px-4 max-w-7xl">
                    <div className={`flex items-center justify-between transition-all duration-500 gap-4 ${scrolled ? "h-14" : "h-16 md:h-20"}`}>

                        {/* 3. LOGO */}
                        <Link href="/" className="flex flex-shrink-0 items-center gap-2.5 group">
                            <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 overflow-hidden group-hover:border-cyan-500/50 transition-colors shadow-lg group-hover:shadow-cyan-500/25">
                                <Image
                                    src="/logo.png"
                                    alt="RoxyNime Logo"
                                    fill
                                    className="object-contain p-1"
                                    priority
                                />
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


                            {/* Mobile/Tablet Sidebar Toggle Button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center justify-center transition-all duration-200"
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
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div className={`fixed top-0 left-0 bottom-0 z-[70] w-72 max-w-[80vw] bg-gray-950/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-out lg:hidden ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Sidebar header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <Image
                                src="/logo.png"
                                alt="RoxyNime Logo"
                                fill
                                className="object-contain p-0.5"
                            />
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


            </div>
        </>
    );
}

