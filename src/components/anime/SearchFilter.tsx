"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterState) => void;
    onProviderChange?: (provider: string) => void;
    selectedProvider?: string;
    className?: string;
}

export interface FilterState {
    type: string;
    genre: string;
    order: string;
}

const TYPES = [
    { value: "", label: "All Types" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
    { value: "movie", label: "Movie" },
];

const GENRES = [
    { value: "", label: "All Genres" },
    { value: "action", label: "Action" },
    { value: "adventure", label: "Adventure" },
    { value: "comedy", label: "Comedy" },
    { value: "drama", label: "Drama" },
    { value: "fantasy", label: "Fantasy" },
    { value: "horror", label: "Horror" },
    { value: "isekai", label: "Isekai" },
    { value: "mecha", label: "Mecha" },
    { value: "music", label: "Music" },
    { value: "mystery", label: "Mystery" },
    { value: "psychological", label: "Psychological" },
    { value: "romance", label: "Romance" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "seinen", label: "Seinen" },
    { value: "shounen", label: "Shounen" },
    { value: "slice-of-life", label: "Slice of Life" },
    { value: "sports", label: "Sports" },
    { value: "supernatural", label: "Supernatural" },
    { value: "thriller", label: "Thriller" },
];

const ORDERS = [
    { value: "updated", label: "Recently Updated" },
    { value: "rating", label: "Highest Rated" },
    { value: "title", label: "A-Z (Alphabetical)" },
];

export const PROVIDER_LIST = [
    { id: "all", label: "Semua", icon: "🌐", description: "Semua sumber" },
    { id: "otakudesu", label: "Otakudesu", icon: "🎌", description: "Sub Indo" },
    { id: "samehadaku", label: "Samehadaku", icon: "🦈", description: "Movies" },
];

export function SearchFilter({
    onSearch,
    onFilterChange,
    onProviderChange,
    selectedProvider = "all",
    className,
}: SearchFilterProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        type: "",
        genre: "",
        order: "updated",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters = { type: "", genre: "", order: "updated" };
        setFilters(defaultFilters);
        setSearchQuery("");
        onSearch("");
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters = filters.type || filters.genre || searchQuery;

    return (
        <div className={cn("space-y-3 sm:space-y-4", className)}>
            {/* ── Provider Selector Chips ─────────────────────────────────── */}
            {onProviderChange && (
                <div className="relative">
                    <div 
                        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1"
                        style={{ WebkitOverflowScrolling: "touch" }}
                    >
                        {PROVIDER_LIST.map((provider) => {
                            const isActive = selectedProvider === provider.id;
                            return (
                                <button
                                    key={provider.id}
                                    onClick={() => onProviderChange(provider.id)}
                                    className={cn(
                                        // Base: compact on mobile, roomier on tablet/desktop
                                        "flex items-center gap-1.5 sm:gap-2",
                                        "px-3 py-2 sm:px-4 sm:py-2.5",
                                        "rounded-lg sm:rounded-xl",
                                        "text-xs sm:text-sm font-medium",
                                        "whitespace-nowrap transition-all duration-200",
                                        "border flex-shrink-0",
                                        // Active vs inactive styling
                                        isActive
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-95"
                                    )}
                                >
                                    <span className="text-sm sm:text-base leading-none">{provider.icon}</span>
                                    <span>{provider.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    {/* Fade edge on mobile/tablet for scroll hint */}
                    <div className="absolute right-0 top-0 bottom-2 w-6 sm:w-8 bg-gradient-to-l from-background to-transparent pointer-events-none xl:hidden" />
                </div>
            )}

            {/* Search Bar — stacks on mobile, inline on larger screens */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search anime..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10 text-sm sm:text-base"
                    />
                </div>
                <button type="submit" className="btn-primary px-4 sm:px-6 text-sm sm:text-base flex-shrink-0">
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "btn-outline px-2.5 sm:px-3 flex-shrink-0",
                        showFilters && "bg-primary text-primary-foreground"
                    )}
                >
                    <Filter className="h-4 w-4" />
                </button>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <div className="glass-card p-3 sm:p-4 space-y-3 sm:space-y-4 fade-in">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm sm:text-base">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Genre Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Genre</label>
                            <select
                                value={filters.genre}
                                onChange={(e) => handleFilterChange("genre", e.target.value)}
                                className="input text-sm sm:text-base"
                            >
                                {GENRES.map((genre) => (
                                    <option key={genre.value} value={genre.value}>
                                        {genre.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Order Filter */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Sort By</label>
                            <select
                                value={filters.order}
                                onChange={(e) => handleFilterChange("order", e.target.value)}
                                className="input text-sm sm:text-base"
                            >
                                {ORDERS.map((order) => (
                                    <option key={order.value} value={order.value}>
                                        {order.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
