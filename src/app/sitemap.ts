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

// ── Halaman statis legal & informasi ─────────────────────────────────────
const STATIC_INFO_PAGES = [
    "/privacy",
    "/terms",
    "/dmca",
    "/contact",
];

// ── FITUR BARU: Multiple Sitemaps (generateSitemaps) ──────────────────────
// Fungsi ini membagi sitemap menjadi 5 file terpisah agar server tidak timeout (504)
export async function generateSitemaps() {
    return [
        { id: 0 }, // sitemap/0.xml: Halaman statis, genre, dan trending (Prioritas 1)
        { id: 1 }, // sitemap/1.xml: Ongoing halaman 1 & 2
        { id: 2 }, // sitemap/2.xml: Completed halaman 1 & 2
        { id: 3 }, // sitemap/3.xml: Completed halaman 3 & 4
        { id: 4 }, // sitemap/4.xml: Movies halaman 1 & 2
    ];
}

export default async function sitemap({ id }: { id: Promise<number | string> | number | string }): Promise<MetadataRoute.Sitemap> {
    const resolvedId = await id;
    const parsedId = Number(resolvedId);
    const now = new Date();

    // Fungsi pembantu untuk memformat URL anime dan mencegah duplikasi
    const formatAnimeUrls = (animes: any[], freq: "daily" | "weekly" | "monthly", prio: number): MetadataRoute.Sitemap => {
        const seen = new Set<string>();
        const unique = animes.filter(a => {
            const key = a.slug || a.id;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return unique.map(a => ({
            url: `${BASE_URL}/anime/${a.slug || a.id}?source=${a._source || "otakudesu"}`,
            lastModified: now,
            changeFrequency: freq,
            priority: prio
        }));
    };

    // ───────────────────────────────────────────────────────────────────────
    // SITEMAP ID 0: Halaman Statis, Filter, Genre & Trending Anime
    // ───────────────────────────────────────────────────────────────────────
    if (parsedId === 0) {
        const staticPages: MetadataRoute.Sitemap = [
            { url: BASE_URL, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
            { url: `${BASE_URL}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
            { url: `${BASE_URL}/ongoing`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
            { url: `${BASE_URL}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
            { url: `${BASE_URL}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
            ...STATIC_INFO_PAGES.map((path) => ({ url: `${BASE_URL}${path}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 })),
            { url: `${BASE_URL}/browse?type=ongoing`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
            { url: `${BASE_URL}/browse?type=completed`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
            { url: `${BASE_URL}/browse?type=movie`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
            ...POPULAR_GENRES.map((genre) => ({ url: `${BASE_URL}/browse?genre=${genre}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
        ];

        let trendingPages: MetadataRoute.Sitemap = [];
        try {
            const trending = await getTrendingAnime();
            const animes = Array.isArray(trending) ? trending : ((trending as any)?.data || []);
            trendingPages = formatAnimeUrls(animes, "daily", 0.9);
        } catch (error) {
            console.error("[sitemap] Failed to fetch trending:", error);
        }
        return [...staticPages, ...trendingPages];
    }

    // ───────────────────────────────────────────────────────────────────────
    // SITEMAP ID 1: Ongoing Anime (Page 1 & 2)
    // ───────────────────────────────────────────────────────────────────────
    if (parsedId === 1) {
        let ongoingPages: MetadataRoute.Sitemap = [];
        try {
            const [p1, p2] = await Promise.allSettled([getOngoingAnimeList(1), getOngoingAnimeList(2)]);
            const a1 = p1.status === "fulfilled" ? (Array.isArray(p1.value) ? p1.value : p1.value?.data || []) : [];
            const a2 = p2.status === "fulfilled" ? (Array.isArray(p2.value) ? p2.value : p2.value?.data || []) : [];
            ongoingPages = formatAnimeUrls([...a1, ...a2], "daily", 0.8);
        } catch (error) {
            console.error("[sitemap] Failed to fetch ongoing:", error);
        }
        return ongoingPages;
    }

    // ───────────────────────────────────────────────────────────────────────
    // SITEMAP ID 2: Completed Anime (Page 1 & 2)
    // ───────────────────────────────────────────────────────────────────────
    if (parsedId === 2) {
        let completedPages: MetadataRoute.Sitemap = [];
        try {
            const [p1, p2] = await Promise.allSettled([getCompletedAnimeList(1), getCompletedAnimeList(2)]);
            const a1 = p1.status === "fulfilled" ? (Array.isArray(p1.value) ? p1.value : p1.value?.data || []) : [];
            const a2 = p2.status === "fulfilled" ? (Array.isArray(p2.value) ? p2.value : p2.value?.data || []) : [];
            completedPages = formatAnimeUrls([...a1, ...a2], "weekly", 0.7);
        } catch (error) {
            console.error("[sitemap] Failed to fetch completed p1-p2:", error);
        }
        return completedPages;
    }

    // ───────────────────────────────────────────────────────────────────────
    // SITEMAP ID 3: Completed Anime (Page 3 & 4)
    // ───────────────────────────────────────────────────────────────────────
    if (parsedId === 3) {
        let completedPages: MetadataRoute.Sitemap = [];
        try {
            const [p3, p4] = await Promise.allSettled([getCompletedAnimeList(3), getCompletedAnimeList(4)]);
            const a3 = p3.status === "fulfilled" ? (Array.isArray(p3.value) ? p3.value : p3.value?.data || []) : [];
            const a4 = p4.status === "fulfilled" ? (Array.isArray(p4.value) ? p4.value : p4.value?.data || []) : [];
            completedPages = formatAnimeUrls([...a3, ...a4], "weekly", 0.6);
        } catch (error) {
            console.error("[sitemap] Failed to fetch completed p3-p4:", error);
        }
        return completedPages;
    }

    // ───────────────────────────────────────────────────────────────────────
    // SITEMAP ID 4: Movies (Page 1 & 2)
    // ───────────────────────────────────────────────────────────────────────
    if (parsedId === 4) {
        let moviePages: MetadataRoute.Sitemap = [];
        try {
            const [p1, p2] = await Promise.allSettled([getMoviesList(1), getMoviesList(2)]);
            const a1 = p1.status === "fulfilled" ? (Array.isArray(p1.value) ? p1.value : p1.value?.data || []) : [];
            const a2 = p2.status === "fulfilled" ? (Array.isArray(p2.value) ? p2.value : p2.value?.data || []) : [];
            moviePages = formatAnimeUrls([...a1, ...a2], "monthly", 0.6);
        } catch (error) {
            console.error("[sitemap] Failed to fetch movies:", error);
        }
        return moviePages;
    }

    return [];
}