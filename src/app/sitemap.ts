// src/app/sitemap.ts
import { MetadataRoute } from "next";

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

    return staticPages;
}