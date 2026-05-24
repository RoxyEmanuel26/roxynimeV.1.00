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
} from "@/lib/sitemap-utils";
import type { SitemapIndex } from "@/lib/sitemap-utils";
import prisma from "@/lib/prisma";

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
  const animeCount = await prisma.sitemapCache.count({
    where: { type: "anime" },
  });
  const latestAnime = await prisma.sitemapCache.findFirst({
    where: { type: "anime" },
    orderBy: { updatedAt: "desc" },
  });
  const animeChunks = animeCount > 0 ? Math.ceil(animeCount / CHUNK_SIZE) : 1;
  const animeLastmod = latestAnime ? getLastmodWIB(latestAnime.updatedAt) : now;
  for (let i = 1; i <= animeChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_anime_${i}.xml`,
      lastmod: animeLastmod,
    });
  }

  // ── 3. Watch/episode chunks ──
  const watchCount = await prisma.sitemapCache.count({
    where: { type: "watch" },
  });
  const latestWatch = await prisma.sitemapCache.findFirst({
    where: { type: "watch" },
    orderBy: { updatedAt: "desc" },
  });
  const watchChunks = watchCount > 0 ? Math.ceil(watchCount / CHUNK_SIZE) : 1;
  const watchLastmod = latestWatch ? getLastmodWIB(latestWatch.updatedAt) : now;
  for (let i = 1; i <= watchChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_watch_${i}.xml`,
      lastmod: watchLastmod,
    });
  }

  // ── 4. Movie chunks ──
  const movieCount = await prisma.sitemapCache.count({
    where: { type: "movie" },
  });
  const latestMovie = await prisma.sitemapCache.findFirst({
    where: { type: "movie" },
    orderBy: { updatedAt: "desc" },
  });
  const movieChunks = movieCount > 0 ? Math.ceil(movieCount / CHUNK_SIZE) : 1;
  const movieLastmod = latestMovie ? getLastmodWIB(latestMovie.updatedAt) : now;
  for (let i = 1; i <= movieChunks; i++) {
    sitemaps.push({
      loc: `${BASE_URL}/sitemap_movies_${i}.xml`,
      lastmod: movieLastmod,
    });
  }

  const xml = generateSitemapIndexXML(sitemaps);
  return xmlResponse(xml, true);
}