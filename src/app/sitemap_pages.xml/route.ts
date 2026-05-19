/**
 * route.ts - /sitemap_pages.xml
 * Sitemap untuk halaman statis: /, /browse, /ongoing, /movies, /schedule, /contact, /privacy, /terms, /dmca.
 * Cache-Control: max-age=86400, ISR revalidate=86400.
 * Dibuat: 20 Mei 2026
 *
 * ── lastmod strategy ──
 * Halaman DINAMIS (berubah tiap hari): /, /browse, /ongoing, /movies, /schedule → pakai getLastmodWIB()
 * Halaman STATIS (jarang berubah): /contact, /privacy, /terms, /dmca → pakai SITE_LAUNCH_DATE hardcode
 * Ini mencegah Google membuang crawl budget pada halaman yang tidak pernah berubah.
 */

import {
  BASE_URL,
  SITE_LAUNCH_DATE,
  getLastmodWIB,
  generateUrlsetXML,
  xmlResponse,
} from "@/lib/sitemap-utils";
import type { SitemapURL } from "@/lib/sitemap-utils";

/** ISR: revalidate setiap 24 jam */
export const revalidate = 86400;

export function GET(): Response {
  const now = getLastmodWIB();

  const urls: SitemapURL[] = [
    // ── DINAMIS — berubah tiap hari, pakai lastmod = sekarang ──
    { loc: `${BASE_URL}/`, lastmod: now, changefreq: "daily", priority: 1.0 },
    {
      loc: `${BASE_URL}/browse`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.9,
    },
    {
      loc: `${BASE_URL}/ongoing`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.9,
    },
    {
      loc: `${BASE_URL}/movies`,
      lastmod: now,
      changefreq: "daily",
      priority: 0.8,
    },
    {
      loc: `${BASE_URL}/schedule`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    },

    // ── STATIS — jarang berubah, pakai SITE_LAUNCH_DATE hardcode ──
    {
      loc: `${BASE_URL}/contact`,
      lastmod: SITE_LAUNCH_DATE,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: `${BASE_URL}/privacy`,
      lastmod: SITE_LAUNCH_DATE,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: `${BASE_URL}/terms`,
      lastmod: SITE_LAUNCH_DATE,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: `${BASE_URL}/dmca`,
      lastmod: SITE_LAUNCH_DATE,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  const xml = generateUrlsetXML(urls);
  return xmlResponse(xml, true);
}