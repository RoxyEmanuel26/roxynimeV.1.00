/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * route.ts - /sitemap_watch_[id].xml
 * Sitemap untuk halaman watch episode (/watch/[slug]).
 * Per 1000 URL per chunk, baca dari public/cache/watch-list.json.
 * Cache-Control: max-age=86400, ISR revalidate=86400.
 * Dibuat: 20 Mei 2026
 */

import {
  readCacheFile,
  CHUNK_SIZE,
  BASE_URL,
  getLastmodWIB,
  generateUrlsetXML,
  xmlResponse,
} from "@/lib/sitemap-utils";
import type { AnimeCache, SitemapURL } from "@/lib/sitemap-utils";

/** ISR: revalidate setiap 24 jam */
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

  const now = getLastmodWIB();

  try {
    const cache = await readCacheFile<AnimeCache>("watch-list.json");

    if (!cache || !cache.data || cache.data.length === 0) {
      return xmlResponse(generateUrlsetXML([]), true);
    }

    const startIndex = (chunkNum - 1) * CHUNK_SIZE;
    const endIndex = startIndex + CHUNK_SIZE;
    const slice = cache.data.slice(startIndex, endIndex);

    if (slice.length === 0) {
      return xmlResponse(generateUrlsetXML([]), true);
    }

    const urls: SitemapURL[] = slice.map((item) => ({
      loc: `${BASE_URL}/watch/${encodeURIComponent(item.slug)}`,
      lastmod: item.updatedAt || cache.updatedAt || now,
      changefreq: "daily" as const,
      priority: 0.7,
    }));

    const xml = generateUrlsetXML(urls);
    return xmlResponse(xml, true);
  } catch (err) {
    console.error(
      `[sitemap_watch_${chunkNum}] Error:`,
      (err as Error).message
    );
    return xmlResponse(generateUrlsetXML([]), true);
  }
}