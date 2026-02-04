"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: FilterState) => void;
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
    { value: "mecha", label: "Mecha" },
    { value: "music", label: "Music" },
    { value: "mystery", label: "Mystery" },
    { value: "psychological", label: "Psychological" },
    { value: "romance", label: "Romance" },
    { value: "sci-fi", label: "Sci-Fi" },
    { value: "slice-of-life", label: "Slice of Life" },
    { value: "sports", label: "Sports" },
    { value: "supernatural", label: "Supernatural" },
    { value: "thriller", label: "Thriller" },
];

const ORDERS = [
    { value: "updated", label: "Recently Updated" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
];

export function SearchFilter({
    onSearch,
    onFilterChange,
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
        <div className={cn("space-y-4", className)}>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search anime..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
                <button type="submit" className="btn-primary px-6">
                    Search
                </button>
                <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                        "btn-outline px-3",
                        showFilters && "bg-primary text-primary-foreground"
                    )}
                >
                    <Filter className="h-4 w-4" />
                </button>
            </form>

            {/* Filters */}
            {showFilters && (
                <div className="glass-card p-4 space-y-4 fade-in">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Filters</h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange("type", e.target.value)}
                                className="input"
                            >
                                {TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Genre Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Genre</label>
                            <select
                                value={filters.genre}
                                onChange={(e) => handleFilterChange("genre", e.target.value)}
                                className="input"
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
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                value={filters.order}
                                onChange={(e) => handleFilterChange("order", e.target.value)}
                                className="input"
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
