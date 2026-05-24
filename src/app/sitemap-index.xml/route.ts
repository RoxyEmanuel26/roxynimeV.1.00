/**
 * route.ts - /sitemap-index
 * Sitemap Index XML — daftar semua child sitemap (pages, anime chunks, watch chunks, movie chunks).
 * Membaca dari cache JSON untuk menghitung jumlah chunk.
 * Cache-Control: max-age=86400, ISR revalidate=86400.
 * Dibuat: 20 Mei 2026
 */

import {
  CHUNK_SIZE,
  BASE_URL,
  getLastmodWIB,
  generateSitemapIndexXML,
  xmlResponse,
  getSitemapCacheFromDb,
} from "@/lib/sitemap-utils";
import type { SitemapIndex } from "@/lib/sitemap-utils";

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
  const animeCache = await getSitemapCacheFromDb("anime");
  const animeChunks = animeCache.total > 0 ? Math.ceil(animeCache.total / CHUNK_SIZE) : 1;
  const animeLastmod = getLastmodWIB(new Date(animeCache.updatedAt));
  for (let i = 1; i <= animeChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_anime_${i}.xml`,
      lastmod: animeLastmod,
    });
  }

  // ── 3. Watch/episode chunks ──
  const watchCache = await getSitemapCacheFromDb("watch");
  const watchChunks = watchCache.total > 0 ? Math.ceil(watchCache.total / CHUNK_SIZE) : 1;
  const watchLastmod = getLastmodWIB(new Date(watchCache.updatedAt));
  for (let i = 1; i <= watchChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_watch_${i}.xml`,
      lastmod: watchLastmod,
    });
  }

  // ── 4. Movie chunks ──
  const movieCache = await getSitemapCacheFromDb("movie");
  const movieChunks = movieCache.total > 0 ? Math.ceil(movieCache.total / CHUNK_SIZE) : 1;
  const movieLastmod = getLastmodWIB(new Date(movieCache.updatedAt));
  for (let i = 1; i <= movieChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_movies_${i}.xml`,
      lastmod: movieLastmod,
    });
  }

  const xml = generateSitemapIndexXML(sitemaps);
  return xmlResponse(xml, true);
}