/**
 * sitemap-utils.ts
 * Utility functions untuk sitemap XML generator, cache I/O, dan helper WIB timezone.
 * Dibuat: 20 Mei 2026
 */


// ── Interfaces ────────────────────────────────────────────────────────

/** Satu <url> entry dalam sitemap XML */
export interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

/** Satu <sitemap> entry dalam sitemap index XML */
export interface SitemapIndex {
  loc: string;
  lastmod: string;
}

/** Struktur file cache anime/movie/watch list */
export interface AnimeCache {
  updatedAt: string;
  total: number;
  data: AnimeCacheItem[];
}

/** Satu item dalam cache list */
export interface AnimeCacheItem {
  slug: string;
  updatedAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────

/** Ukuran maksimum URL per chunk sitemap (Google limit: 50.000, kita pakai 1.000) */
export const CHUNK_SIZE = 1000;

/** Base URL website — ambil dari env, fallback ke production URL */
export const BASE_URL: string =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.roxy.my.id";

/**
 * Tanggal rilis/last-update halaman statis.
 * Update konstanta ini jika halaman /contact, /privacy, /terms, /dmca diubah kontennya.
 */
export const SITE_LAUNCH_DATE = "2026-05-20T00:00:00+07:00";

// ── Functions ─────────────────────────────────────────────────────────

/**
 * Delay selama `ms` milidetik.
 * Digunakan untuk throttle antar request API agar tidak kena rate limit.
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Kembalikan string datetime ISO 8601 dengan offset WIB (+07:00).
 * Format: YYYY-MM-DDThh:mm:ss+07:00
 *
 * @param date - (Opsional) Date object, default sekarang
 */
export function getLastmodWIB(date?: Date): string {
  const d = date ?? new Date();

  // Hitung komponen tahun, bulan, tanggal dalam WIB
  // UTC+7 = 7 jam di depan UTC
  const offsetMs = 7 * 60 * 60 * 1000; // +07:00
  const localTime = new Date(d.getTime() + offsetMs);

  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localTime.getUTCDate()).padStart(2, "0");
  const hours = String(localTime.getUTCHours()).padStart(2, "0");
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(localTime.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+07:00`;
}

/**
 * Escape karakter yang tidak valid dalam XML.
 * URUTAN WAJIB: & diprocess PERTAMA (sebelum <, >, ", ')
 * karena & adalah bagian dari representasi entity itu sendiri (&, <, dll).
 * Jika & tidak diprocess pertama, karakter "<" bisa menjadi "&lt;" (double-encode).
 *
 * @param str - String yang akan di-escape
 * @returns String yang sudah di-escape untuk XML
 *
 * @example
 * escapeXml('Tom & Jerry <3')        // "Tom & Jerry <3"
 * escapeXml('Say "hello" & bye')     // "Say "hello" & bye"
 * escapeXml("It's fine & fun")       // "It's fine & fun"
 */
export function escapeXml(str: string): string {
  // Use concatenation to prevent formatter from double-encoding the entities
  const amp  = "&" + "amp;";
  const lt   = "&" + "lt;";
  const gt   = "&" + "gt;";
  const quot = "&" + "quot;";
  const apos = "&" + "apos;";

  return str
    .replaceAll("&", amp)
    .replaceAll("<", lt)
    .replaceAll(">", gt)
    .replaceAll('"', quot)
    .replaceAll("'", apos);
}
/**
 * Generate XML <urlset> lengkap dari array SitemapURL.
 *
 * @param urls - Array of SitemapURL entries
 * @returns String XML yang valid W3C
 */
export function generateUrlsetXML(urls: SitemapURL[]): string {
  const items: string[] = urls.map((url) => {
    return [
      "  <url>",
      `    <loc>${escapeXml(url.loc)}</loc>`,
      `    <lastmod>${escapeXml(url.lastmod)}</lastmod>`,
      `    <changefreq>${escapeXml(url.changefreq)}</changefreq>`,
      `    <priority>${url.priority}</priority>`,
      "  </url>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
    items.join("\n"),
    "</urlset>",
  ].join("\n");
}

/**
 * Generate XML <sitemapindex> lengkap dari array SitemapIndex.
 *
 * @param sitemaps - Array of SitemapIndex entries
 * @returns String XML yang valid W3C
 */
export function generateSitemapIndexXML(sitemaps: SitemapIndex[]): string {
  const items: string[] = sitemaps.map((sm) => {
    return [
      "  <sitemap>",
      `    <loc>${escapeXml(sm.loc)}</loc>`,
      `    <lastmod>${escapeXml(sm.lastmod)}</lastmod>`,
      "  </sitemap>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items.join("\n"),
    "</sitemapindex>",
  ].join("\n");
}

/**
 * Buat NextResponse dengan Content-Type application/xml.
 *
 * @param xml - String XML yang akan dikembalikan
 * @param cache - Jika true, tambahkan Cache-Control: public, max-age=86400
 * @returns NextResponse siap pakai
 */
export function xmlResponse(xml: string, cache = true): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/xml; charset=utf-8",
  };

  if (cache) {
    headers["Cache-Control"] =
      "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200";
  }

  return new Response(xml, {
    status: 200,
    headers,
  });
}

// ── Cache Database I/O ────────────────────────────────────────────────

import { prisma } from "@/lib/prisma";

/**
 * Mengambil cache dari database Prisma berdasarkan tipe
 */
export async function getSitemapCacheFromDb(type: "anime" | "movie" | "watch") {
  const records = await prisma.sitemapCache.findMany({
    where: { type },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return {
    updatedAt: records[0]?.updatedAt.toISOString() || new Date().toISOString(),
    total: records.length,
    data: records.map((r) => ({
      slug: r.slug,
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

/**
 * Menyimpan cache baru ke database Prisma
 */
export async function saveSitemapCacheToDb(
  type: "anime" | "movie" | "watch",
  slugs: { slug: string; updatedAt: string }[]
) {
  // Pecah data menjadi chunk maksimal 5000 item untuk mencegah PostgreSQL parameter limit
  const chunkSize = 5000;
  const dataChunks: typeof slugs[] = [];
  for (let i = 0; i < slugs.length; i += chunkSize) {
    dataChunks.push(slugs.slice(i, i + chunkSize));
  }

  // Menggunakan transaksi untuk menghapus cache lama dan menulis yang baru agar aman
  const operations = [
    prisma.sitemapCache.deleteMany({ where: { type } }),
    ...dataChunks.map((chunk) =>
      prisma.sitemapCache.createMany({
        data: chunk.map((item) => ({
          type,
          slug: item.slug,
          updatedAt: new Date(item.updatedAt),
        })),
        skipDuplicates: true,
      })
    ),
  ];

  await prisma.$transaction(operations);
}