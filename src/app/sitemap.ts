// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { getTrendingAnime, getOngoingAnimeList } from "@/lib/animbus";

export const revalidate = 3600;

const BASE_URL = "https://roxy.my.id"; // ← Hardcode URL production-mu

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    ];

    let dynamicPages: MetadataRoute.Sitemap = [];

    try {
        // Fetch trending and ongoing anime to populate dynamic sitemap
        const [trending, ongoing] = await Promise.all([
            getTrendingAnime(),
            getOngoingAnimeList(1)
        ]);

        const allAnimes = [...trending, ...(ongoing?.data || [])];
        
        // Remove duplicates based on anime id
        const uniqueAnimes = Array.from(new Map(allAnimes.map(anime => [anime.id, anime])).values());

        dynamicPages = uniqueAnimes.map((anime) => ({
            url: `${BASE_URL}/anime/${anime.id}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }));
    } catch (error) {
        console.error("Failed to fetch anime for sitemap:", error);
    }

    return [...staticPages, ...dynamicPages];
}