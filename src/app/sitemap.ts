import { MetadataRoute } from "next";
import {
    getTrendingAnime,
    getOngoingAnimeList,
    getCompletedAnimeList,
    getMoviesList,
} from "@/lib/animbus";

export const revalidate = 3600;

const BASE_URL = "https://roxy.my.id";

// Halaman statis legal & informasi
const STATIC_INFO_PAGES = [
    "/privacy",
    "/terms",
    "/dmca",
    "/contact",
    "/schedule",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // ── 1. Halaman Statis Utama ───────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/browse`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/ongoing`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/movies`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/schedule`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
        ...STATIC_INFO_PAGES.filter((p) => p !== "/schedule").map((path) => ({
            url: `${BASE_URL}${path}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.3,
        })),
    ];

    // ── 2. Halaman Dinamis Anime ─────────────────────────────────────────────
    let dynamicPages: MetadataRoute.Sitemap = [];

    try {
        // Fetch semua sumber sekaligus (paralel)
        const [trending, ongoing, completed, movies] = await Promise.allSettled([
            getTrendingAnime(),
            getOngoingAnimeList(1),
            getCompletedAnimeList(1),
            getMoviesList(1),
        ]);

        const allAnimes = [
            ...(trending.status === "fulfilled" ? trending.value : []),
            ...(ongoing.status === "fulfilled" ? ongoing.value.data : []),
            ...(completed.status === "fulfilled" ? completed.value.data : []),
            ...(movies.status === "fulfilled" ? movies.value.data : []),
        ];

        // Hapus duplikat berdasarkan id, filter yang tidak punya id valid
        const seen = new Set<string>();
        const uniqueAnimes = allAnimes.filter((anime) => {
            if (!anime.id || seen.has(anime.id)) return false;
            seen.add(anime.id);
            return true;
        });

        dynamicPages = uniqueAnimes.map((anime) => ({
            // anime.id adalah slug yang dipakai di URL /anime/[slug]
            url: `${BASE_URL}/anime/${anime.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }));

        console.log(`[sitemap] Generated ${dynamicPages.length} dynamic anime pages`);
    } catch (error) {
        // Jika fetch gagal total, sitemap tetap berjalan dengan halaman statis
        console.error("[sitemap] Failed to fetch anime list:", error);
    }

    return [...staticPages, ...dynamicPages];
}