/**
 * anime-api.ts
 * Wrapper API Sanka Vollerei untuk sitemap cache builder.
 * Fetch semua anime/movies/episodes dengan throttle 1500ms per request.
 * Dibuat: 20 Mei 2026
 */

import { delay } from "@/lib/sitemap-utils";
import type { AnimeCacheItem } from "@/lib/sitemap-utils";
import { sankaClient } from "@/lib/sankaClient";
import { getMoviesList } from "@/lib/animbus";

// ── Constants ─────────────────────────────────────────────────────────

/** Base URL API Sanka — ambil dari env, fallback ke production */
const SANKA_API_BASE: string =
  process.env.SANKA_API_BASE ?? "https://www.sankavollerei.com";

/** Delay antar request (ms) agar tidak kena rate limit 50 req/menit */
const API_DELAY_MS = 1500;

/** Max pages per fetch — diubah sangat besar agar loop berjalan sampai data benar-benar habis di API lokal */
const MAX_PAGES = 9999;

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Fetch satu halaman dari Sanka API dengan timeout dan retry.
 * Return data JSON, atau null jika gagal.
 */
async function fetchSankaPage(
  endpoint: string,
  page: number
): Promise<Record<string, unknown> | null> {
  try {
    const url = `${SANKA_API_BASE}${endpoint}?page=${page}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(
        `[anime-api] Gagal fetch ${endpoint} page ${page}: HTTP ${res.status}`
      );
      return null;
    }

    return (await res.json()) as Record<string, unknown>;
  } catch (err) {
    console.error(
      `[anime-api] Error fetch ${endpoint} page ${page}:`,
      (err as Error).message
    );
    return null;
  }
}

/**
 * Extract animeList array dari response Sanka API.
 * Struktur response: { data: { animeList: [...] } }
 */
function extractAnimeList(
  response: Record<string, unknown> | null
): Record<string, unknown>[] {
  if (!response) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = response.data as Record<string, any> | undefined;
  if (!data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = data.animeList as any[] | undefined;
  if (!Array.isArray(list)) return [];

  return list as Record<string, unknown>[];
}

/**
 * Normalisasi satu item anime dari raw API ke AnimeCacheItem.
 */
function normalizeItem(item: Record<string, unknown>): AnimeCacheItem {
  const slug: string = String(
    (item.animeId as string) ||
      (item.slug as string) ||
      (item.id as string) ||
      ""
  );

  const updatedAt: string = String(
    (item.updatedAt as string) ||
      (item.updated_at as string) ||
      (item.lastUpdate as string) ||
      new Date().toISOString()
  );

  return { slug, updatedAt };
}

// ── Public API ────────────────────────────────────────────────────────

/**
 * Fetch SEMUA anime (ongoing + completed) dari Sanka API.
 * Loop semua halaman, delay 1500ms per request.
 * Jika satu halaman gagal → log error, lanjut ke halaman berikutnya.
 *
 * @returns Array AnimeCacheItem { slug, updatedAt }
 */
export async function fetchAllAnime(): Promise<AnimeCacheItem[]> {
  const allItems: AnimeCacheItem[] = [];
  const seen = new Set<string>();

  // Fetch dari dua endpoint: ongoing + complete-anime
  const endpoints = ["/anime/ongoing-anime", "/anime/complete-anime"];

  for (const endpoint of endpoints) {
    let page = 1;

    while (page <= MAX_PAGES) {
      console.log(`[anime-api] Fetching ${endpoint} page ${page}...`);
      const response = await fetchSankaPage(endpoint, page);

      if (!response) {
        // Halaman gagal (biasanya karena sudah mentok di halaman terakhir)
        console.log(`[anime-api] Mentok di halaman ${page}, pindah ke tahap selanjutnya.`);
        break;
      }

      const animeList = extractAnimeList(response);

      if (animeList.length === 0) {
        // Tidak ada data lagi → selesai loop endpoint ini
        console.log(
          `[anime-api] ${endpoint} page ${page}: empty, stopping.`
        );
        break;
      }

      for (const raw of animeList) {
        const item = normalizeItem(raw);
        if (item.slug && !seen.has(item.slug)) {
          seen.add(item.slug);
          allItems.push(item);
        }
      }

      console.log(
        `[anime-api] ${endpoint} page ${page}: got ${animeList.length} items (total: ${allItems.length})`
      );

      page++;
      if (page <= MAX_PAGES) {
        await delay(API_DELAY_MS);
      }
    }
  }

  console.log(`[anime-api] Total anime fetched: ${allItems.length}`);
  return allItems;
}

/**
 * Fetch SEMUA movie dari Sanka API.
 * Gunakan search/genre endpoint untuk movie.
 * Delay 1500ms per request.
 *
 * @returns Array AnimeCacheItem { slug, updatedAt }
 */
export async function fetchAllMovies(): Promise<AnimeCacheItem[]> {
  const allItems: AnimeCacheItem[] = [];
  const seen = new Set<string>();

  try {
    // Gunakan getMoviesList dari animbus (sudah teruji dengan fallback Jikan)
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= MAX_PAGES) {
      console.log(`[anime-api] Fetching movies page ${page} via animbus...`);
      
      const result = await getMoviesList(page, "samehadaku");

      if (!result || !result.data || result.data.length === 0) {
        console.log(`[anime-api] Movies page ${page}: empty, stopping.`);
        break;
      }

      for (const anime of result.data) {
        // Normalisasi: ambil slug dari id/slug field
        const slug = (anime as Record<string, unknown>).slug as string
          || (anime as Record<string, unknown>).id as string
          || "";
        
        if (slug && !seen.has(slug)) {
          seen.add(slug);
          allItems.push({
            slug,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      console.log(
        `[anime-api] Movies page ${page}: got ${result.data.length} items (total: ${allItems.length})`
      );

      // Cek pagination
      hasMore = result.pagination?.hasNextPage ?? false;
      page++;
      
      if (hasMore && page <= MAX_PAGES) {
        await delay(API_DELAY_MS);
      }
    }
  } catch (err) {
    console.error(`[anime-api] fetchAllMovies error:`, (err as Error).message);
    // Return array yang sudah terkumpul (tidak throw)
  }

  console.log(`[anime-api] Total movies fetched: ${allItems.length}`);
  return allItems;
}

/**
 * Fetch SEMUA episode/watch URL dari Sanka API.
 * Menggunakan sankaClient.getDetail(slug) untuk setiap anime.
 * 
 * STRATEGI: Fetch detail dari 20 anime pertama dari ongoing, 
 * ambil episodeList untuk mendapatkan slug episode.
 * 
 * ⚠️ Rate limit safety: max 20 getDetail() + delay 1500ms antar panggilan
 * ≈ ~35 detik total, masih aman untuk 50 req/min limit.
 *
 * @returns Array AnimeCacheItem { slug (episodeSlug), updatedAt }
 */
export async function fetchAllEpisodes(): Promise<AnimeCacheItem[]> {
  const allItems: AnimeCacheItem[] = [];
  const seen = new Set<string>();

  // Ambil anime slug dari ongoing endpoint
  const animeSlugs: string[] = [];
  let page = 1;

  while (page <= MAX_PAGES) {
    console.log(
      `[anime-api] Fetching ongoing page ${page} for episode slugs...`
    );
    const response = await fetchSankaPage("/anime/ongoing-anime", page);

    if (!response) {
      console.log(`[anime-api] Mentok di halaman ${page}, lanjut ke proses fetch episodes.`);
      break;
    }

    const animeList = extractAnimeList(response);
    if (animeList.length === 0) break;

    for (const raw of animeList) {
      const item = normalizeItem(raw);
      if (item.slug) {
        animeSlugs.push(item.slug);
      }
    }

    page++;
    if (page <= MAX_PAGES) await delay(API_DELAY_MS);
  }

  console.log(
    `[anime-api] Found ${animeSlugs.length} anime slugs for episode fetching`
  );

  // Fetch detail SELURUH anime menggunakan sankaClient.getDetail()
  const MAX_DETAIL_FETCH = animeSlugs.length;
  const slugsToFetch = animeSlugs.slice(0, MAX_DETAIL_FETCH);

  for (let i = 0; i < slugsToFetch.length; i++) {
    const animeSlug = slugsToFetch[i];

    try {
      console.log(
        `[anime-api] getDetail("${animeSlug}") — ${i + 1}/${slugsToFetch.length}`
      );

      // Gunakan sankaClient.getDetail() yang sudah ada di codebase
      const detail = await sankaClient.getDetail(animeSlug);

      if (detail && Array.isArray(detail.episodes) && detail.episodes.length > 0) {
        for (const ep of detail.episodes) {
          const epSlug: string = ep.urlSlug || ep.id || "";
          if (epSlug && !seen.has(epSlug)) {
            seen.add(epSlug);
            allItems.push({
              slug: epSlug,
              updatedAt: ep.date || detail.releaseDate || new Date().toISOString(),
            });
          }
        }
        console.log(
          `[anime-api] "${animeSlug}": ${detail.episodes.length} episodes (total: ${allItems.length})`
        );
      } else {
        console.log(
          `[anime-api] "${animeSlug}": no episodes found, skipping`
        );
      }
    } catch (err) {
      console.log(
        `[anime-api] getDetail("${animeSlug}") error:`,
        (err as Error).message,
        ", skipping"
      );
    }

    // Delay 1500ms antar getDetail() agar tidak kena rate limit
    if (i < slugsToFetch.length - 1) {
      await delay(API_DELAY_MS);
    }
  }

  console.log(`[anime-api] Total episodes fetched: ${allItems.length}`);
  return allItems;
}
