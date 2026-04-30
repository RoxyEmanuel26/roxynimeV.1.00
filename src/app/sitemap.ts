import { MetadataRoute } from "next";
import {
    getTrendingAnime,
    getOngoingAnimeList,
    getCompletedAnimeList,
    getMoviesList,
} from "@/lib/animbus";

// Revalidate sitemap setiap 6 jam agar Google selalu mendapat data fresh
export const revalidate = 21600;

const BASE_URL = "https://roxy.my.id";

// ── Daftar semua genre populer (untuk indexing halaman genre) ──────────────
const POPULAR_GENRES = [
    "action", "adventure", "comedy", "drama", "ecchi", "fantasy",
    "harem", "horror", "isekai", "martial-arts", "mecha", "military",
    "music", "mystery", "psychological", "romance", "school",
    "sci-fi", "seinen", "shoujo", "shounen", "slice-of-life",
    "sports", "supernatural", "thriller",
];

// ── Semua provider yang didukung ──────────────────────────────────────────
const PROVIDERS = ["otakudesu", "samehadaku", "donghua", "winbu"];

// ── Halaman statis legal & informasi ─────────────────────────────────────
const STATIC_INFO_PAGES = [
    "/privacy",
    "/terms",
    "/dmca",
    "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ── 1. Halaman Statis Utama ──────────────────────────────────────────────
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/browse`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/ongoing`,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 0.95,
        },
        {
            url: `${BASE_URL}/movies`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/schedule`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        // Halaman legal
        ...STATIC_INFO_PAGES.map((path) => ({
            url: `${BASE_URL}${path}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.3,
        })),
    ];

    // ── 2. Halaman Browse berdasarkan Filter Type ────────────────────────────
    const browseFilterPages: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/browse?type=ongoing`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
        { url: `${BASE_URL}/browse?type=completed`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
        { url: `${BASE_URL}/browse?type=movie`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    ];

    // ── 3. Halaman Genre ─────────────────────────────────────────────────────
    const genrePages: MetadataRoute.Sitemap = POPULAR_GENRES.map((genre) => ({
        url: `${BASE_URL}/browse?genre=${genre}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    // ── 4. Halaman Dinamis Anime ─────────────────────────────────────────────
    let dynamicPages: MetadataRoute.Sitemap = [];

    try {
        // Fetch data secukupnya saja untuk mencegah Error 504 Timeout di Vercel.
        // Google akan merayapi anime lain secara otomatis melalui halaman /browse (pagination).
        const fetchPromises = [
            getTrendingAnime(),
            getOngoingAnimeList(1),
            getCompletedAnimeList(1),
        ];

        // Kita hapus loop yang me-request semua provider secara berlebihan
        // karena itu memakan waktu lama dan menyebabkan sitemap gagal di-load oleh Google.

        const results = await Promise.allSettled(fetchPromises);

        const allAnimes: any[] = [];
        results.forEach((result) => {
            if (result.status === "fulfilled") {
                const val = result.value;
                if (Array.isArray(val)) {
                    allAnimes.push(...val);
                } else if (val?.data && Array.isArray(val.data)) {
                    allAnimes.push(...val.data);
                }
            }
        });

        // Deduplikasi berdasarkan slug/id
        const seen = new Set<string>();
        const uniqueAnimes = allAnimes.filter((anime) => {
            const key = anime.slug || anime.id;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Tentukan source terbaik untuk setiap anime berdasarkan provider
        dynamicPages = uniqueAnimes.map((anime) => {
            const slug = anime.slug || anime.id;
            const source = anime._source || "otakudesu";
            const isOngoing = anime.status?.toLowerCase?.()?.includes("ongoing");

            return {
                url: `${BASE_URL}/anime/${slug}?source=${source}`,
                lastModified: now,
                changeFrequency: (isOngoing ? "daily" : "weekly") as "daily" | "weekly",
                priority: isOngoing ? 0.8 : 0.7,
            };
        });

        console.log(`[sitemap] Generated ${dynamicPages.length} dynamic anime pages`);
    } catch (error) {
        console.error("[sitemap] Failed to fetch anime list:", error);
    }

    return [...staticPages, ...browseFilterPages, ...genrePages, ...dynamicPages];
}