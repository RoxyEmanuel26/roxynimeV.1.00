/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * route.ts - /sitemap_movies_[id].xml
 * Sitemap untuk halaman movie anime (/anime/[slug]).
 * Per 1000 URL per chunk, baca dari public/cache/movies-list.json.
 * Cache-Control: max-age=86400, ISR revalidate=86400.
 * Dibuat: 20 Mei 2026
 */

import {
  CHUNK_SIZE,
  BASE_URL,
  getLastmodWIB,
  generateUrlsetXML,
  xmlResponse,
} from "@/lib/sitemap-utils";
import type { SitemapURL } from "@/lib/sitemap-utils";
import prisma from "@/lib/prisma";

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<any> }
): Promise<Response> {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const chunkNum = parseInt(id || "", 10);

  if (isNaN(chunkNum) || chunkNum < 1) {
    return xmlResponse(generateUrlsetXML([]), true);
  }


  try {
    const startIndex = (chunkNum - 1) * CHUNK_SIZE;

    // Ambil data slice dari database Prisma
    const items = await prisma.sitemapCache.findMany({
      where: { type: "movie" },
      orderBy: { slug: "asc" },
      skip: startIndex,
      take: CHUNK_SIZE,
    });

    if (items.length === 0) {
      return xmlResponse(generateUrlsetXML([]), true);
    }

    const urls: SitemapURL[] = items.map((item) => ({
      loc: `${BASE_URL}/anime/${encodeURIComponent(item.slug)}`,
      lastmod: getLastmodWIB(item.updatedAt),
      changefreq: "daily" as const,
      priority: 0.75,
    }));

    const xml = generateUrlsetXML(urls);
    return xmlResponse(xml, true);
  } catch (err) {
    console.error(
      `[sitemap_movies_${chunkNum}] Error:`,
      (err as Error).message
    );
    return xmlResponse(generateUrlsetXML([]), true);
  }
}