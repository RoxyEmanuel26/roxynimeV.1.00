"use client";

import Link from "next/link";
import Image from "next/image";
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
    ChevronDown,
    Compass,
    Play,
    Film,
    Home,
    Sparkles,
} from "lucide-react";
import { BannerAd } from "../ads/BannerAd";

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
        <header className="sticky top-0 z-50 w-full">
            {/* Top Ad Banner */}
            <BannerAd adKey="c89ece9ff04cd88930d8cf0f5e62f70f" width={728} height={90} className="hidden lg:flex" />

            {/* ─── Main Header ─── */}
            <div
                className={`
                    border-b transition-all duration-300
                    ${scrolled
                        ? "bg-background/90 backdrop-blur-xl border-border shadow-sm"
                        : "bg-background/70 backdrop-blur-lg border-transparent"
                    }
                `}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">

                        {/* ─── Logo ─── */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative w-9 h-9">
                                {/* Animated glow ring */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary opacity-80 group-hover:opacity-100 transition-opacity duration-300 pulse-glow" />
                                {/* Inner box */}
                                <div className="absolute inset-[2px] bg-background rounded-[10px] flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight hidden sm:block" style={{ fontFamily: "var(--font-heading)" }}>
                                <span className="gradient-text">Roxy</span>
                                <span className="text-foreground">Nime</span>
                            </span>
                        </Link>

                        {/* ─── Desktop Nav ─── */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`nav-link px-3 py-1.5 rounded-lg ${isActive(link.href) ? "active text-primary" : ""}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* ─── Desktop Search ─── */}
                        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari anime..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input pl-10 h-10 text-sm"
                                />
                            </div>
                        </form>

                        {/* ─── Right Actions ─── */}
                        <div className="flex items-center gap-1.5">
                            {/* Theme Toggle */}
                            {mounted && (
                                <button
                                    onClick={toggleTheme}
                                    className="theme-toggle"
                                    aria-label="Toggle theme"
                                >
                                    {theme === "dark" ? (
                                        <Sun className="h-5 w-5 text-warning" />
                                    ) : (
                                        <Moon className="h-5 w-5 text-primary" />
                                    )}
                                </button>
                            )}

                            {/* User Menu */}
                            {session ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 btn-ghost p-1.5 rounded-xl"
                                    >
                                        {session.user.image ? (
                                            <Image
                                                src={session.user.image}
                                                alt={session.user.name || "User"}
                                                width={32}
                                                height={32}
                                                className="rounded-full ring-2 ring-primary/30"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <ChevronDown className={`h-4 w-4 hidden sm:block transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* User Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-52 glass-card py-1 shadow-lg scale-in overflow-hidden">
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="font-semibold text-sm truncate">{session.user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                            </div>
                                            {[
                                                { href: "/profile", icon: User, label: "Profile" },
                                                { href: "/profile?tab=history", icon: History, label: "Watch History" },
                                                { href: "/profile?tab=favorites", icon: Heart, label: "Favorites" },
                                            ].map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <div className="border-t border-border mt-1 pt-1">
                                                <button
                                                    onClick={() => signOut()}
                                                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/auth/signin" className="btn-primary text-sm px-4 py-2">
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden theme-toggle"
                                aria-label="Toggle menu"
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

                {/* ─── Mobile Menu ─── */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl fade-in">
                        <div className="container mx-auto px-4 py-4 space-y-3">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Cari anime..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="input pl-10"
                                    />
                                </div>
                            </form>

                            {/* Mobile Nav Links */}
                            <nav className="flex flex-col gap-0.5">
                                {NAV_LINKS.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${isActive(link.href)
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted/60 text-fore ground"
                                                }`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
