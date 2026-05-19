/**
 * route.ts - /sitemap-index
 * Sitemap Index XML — daftar semua child sitemap (pages, anime chunks, watch chunks, movie chunks).
 * Membaca dari cache JSON untuk menghitung jumlah chunk.
 * Cache-Control: max-age=86400, ISR revalidate=86400.
 * Dibuat: 20 Mei 2026
 */

import {
  readCacheFile,
  CHUNK_SIZE,
  BASE_URL,
  getLastmodWIB,
  generateSitemapIndexXML,
  xmlResponse,
} from "@/lib/sitemap-utils";
import type { AnimeCache, SitemapIndex } from "@/lib/sitemap-utils";

/** ISR: revalidate setiap 24 jam */
export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const now = getLastmodWIB();
  const sitemaps: SitemapIndex[] = [];

  // ── 1. Static pages sitemap (selalu ada) ──
  sitemaps.push({
    loc: `${BASE_URL}/sitemap_pages.xml`,
    lastmod: now,
  });

  // ── 2. Anime chunks ──
  const animeCache = await readCacheFile<AnimeCache>("anime-list.json");
  const animeChunks = animeCache?.total
    ? Math.ceil(animeCache.total / CHUNK_SIZE)
    : 1;
  for (let i = 1; i <= animeChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_anime_${i}.xml`,
      lastmod: animeCache?.updatedAt ?? now,
    });
  }

  // ── 3. Watch/episode chunks ──
  const watchCache = await readCacheFile<AnimeCache>("watch-list.json");
  const watchChunks = watchCache?.total
    ? Math.ceil(watchCache.total / CHUNK_SIZE)
    : 1;
  for (let i = 1; i <= watchChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_watch_${i}.xml`,
      lastmod: watchCache?.updatedAt ?? now,
    });
  }

  // ── 4. Movie chunks ──
  const movieCache = await readCacheFile<AnimeCache>("movies-list.json");
  const movieChunks = movieCache?.total
    ? Math.ceil(movieCache.total / CHUNK_SIZE)
    : 1;
  for (let i = 1; i <= movieChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_movies_${i}.xml`,
      lastmod: movieCache?.updatedAt ?? now,
    });
  }

  const xml = generateSitemapIndexXML(sitemaps);
  return xmlResponse(xml, true);
}