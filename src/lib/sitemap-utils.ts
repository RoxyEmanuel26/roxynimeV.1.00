/**
 * sitemap-utils.ts
 * Utility functions untuk sitemap XML generator, cache I/O, dan helper WIB timezone.
 * Dibuat: 20 Mei 2026
 */

import { type NextResponse } from "next/server";

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
 * Escape karakter yang tidak valid dalam XML:
 * & → &, < → <, > → >, " → ", ' → '
 */
export function escapeXml(str: string): string {
  // Gunakan dictionary mapping agar entity HTML tidak dikonversi oleh formatter
  const ENTITY_MAP: Record<string, string> = {
    "&": "&" + "amp;",
    "<": "&" + "lt;",
    ">": "&" + "gt;",
    '"': "&" + "quot;",
    "'": "&" + "apos;",
  };

  // Escape & dulu, baru karakter lainnya
  let result = str;
  for (const [char, entity] of Object.entries(ENTITY_MAP)) {
    result = result.replace(new RegExp(char === "&" ? "&" : char, "g"), entity);
  }
  return result;
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
      "public, max-age=86400, stale-while-revalidate=3600";
  }

  return new Response(xml, {
    status: 200,
    headers,
  });
}

// ── Cache File I/O ────────────────────────────────────────────────────

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Baca file JSON dari public/cache/.
 *
 * @param filename - Nama file (contoh: "anime-list.json")
 * @returns Data yang sudah di-parse, atau null jika file tidak ada / error
 */
export async function readCacheFile<T>(filename: string): Promise<T | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "cache", filename);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    // File belum ada atau gagal dibaca → return null (bukan throw)
    return null;
  }
}

/**
 * Tulis file JSON ke public/cache/. Buat folder public/cache/ jika belum ada.
 *
 * @param filename - Nama file (contoh: "anime-list.json")
 * @param data - Data yang akan disimpan (di-serialize ke JSON)
 */
export async function writeCacheFile(
  filename: string,
  data: unknown
): Promise<void> {
  try {
    const dirPath = path.join(process.cwd(), "public", "cache");
    // Buat folder jika belum ada
    await mkdir(dirPath, { recursive: true });

    const filePath = path.join(dirPath, filename);
    const json = JSON.stringify(data, null, 2);
    await writeFile(filePath, json, "utf-8");
  } catch (err) {
    console.error(`[sitemap-utils] Gagal menulis cache file ${filename}:`, err);
  }
}