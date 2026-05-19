/**
 * route.ts - /api/cron/rebuild-sitemap-cache
 * Cron endpoint untuk rebuild sitemap cache.
 * Dipanggil oleh Vercel Cron 1x/hari (jam 01:00 WIB).
 * Menggunakan phase-based execution untuk mengakali Vercel Free 60s limit.
 * Dibuat: 20 Mei 2026
 *
 * ── Flow ──
 * Phase 0 (trigger)  : fire-and-forget Phase 1, 2, 3 via selfInvoke()
 * Phase 1 (anime)    : fetchAllAnime() → public/cache/anime-list.json
 * Phase 2 (movies)   : fetchAllMovies() → public/cache/movies-list.json
 * Phase 3 (episodes) : fetchAllEpisodes() → public/cache/watch-list.json + Ping Google
 */

import { type NextRequest } from "next/server";
import { fetchAllAnime, fetchAllMovies, fetchAllEpisodes } from "@/lib/anime-api";
import {
  writeCacheFile,
  getLastmodWIB,
  BASE_URL,
} from "@/lib/sitemap-utils";
import type { AnimeCache } from "@/lib/sitemap-utils";

// ── Constants ─────────────────────────────────────────────────────────

/** Security header name untuk proteksi cron endpoint */
const AUTH_HEADER = "Authorization";

/** Header khusus Vercel Cron — hanya ada di request dari Vercel Cron internal */
const VERCEL_CRON_HEADER = "x-vercel-cron";

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Validasi cron secret dari request.
 * Menerima 2 jenis request:
 *   1. Vercel Cron internal — header "x-vercel-cron": "1" (trusted, tanpa auth)
 *   2. Manual call — Authorization: Bearer <CRON_SECRET>
 *
 * @param request - Incoming NextRequest
 * @returns true jika authorized
 */
function isAuthorized(request: NextRequest): boolean {
  // 1) Vercel Cron internal — header khusus yang hanya bisa di-set oleh Vercel
  const isVercelCron = request.headers.get(VERCEL_CRON_HEADER) === "1";
  if (isVercelCron) {
    console.log("[cron] Authorized via Vercel Cron header (x-vercel-cron=1)");
    return true;
  }

  // 2) Manual call — harus ada Authorization header
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Dev mode: jika CRON_SECRET tidak diset, izinkan semua request
    console.warn("[cron] CRON_SECRET not set — allowing all requests (dev mode)");
    return true;
  }

  const authHeader = request.headers.get(AUTH_HEADER) ?? "";
  const expected = `Bearer ${cronSecret}`;
  const isValid = authHeader === expected;

  if (!isValid) {
    console.error(
      "[cron] Unauthorized — expected x-vercel-cron=1 or valid Authorization header"
    );
  } else {
    console.log("[cron] Authorized via Authorization header (manual call)");
  }

  return isValid;
}

/**
 * Simpan data ke cache file JSON.
 */
async function saveCache(
  filename: string,
  data: { slug: string; updatedAt: string }[],
  now: string
): Promise<void> {
  const cache: AnimeCache = {
    updatedAt: now,
    total: data.length,
    data,
  };

  await writeCacheFile(filename, cache);
  console.log(
    `[cron] Saved ${data.length} items to public/cache/${filename}`
  );
}

/**
 * Self-invoke: panggil endpoint sendiri dengan phase tertentu.
 * Fire-and-forget — tidak di-await oleh caller.
 */
async function selfInvoke(phase: number): Promise<void> {
  try {
    const cronSecret = process.env.CRON_SECRET ?? "";
    const url = `${BASE_URL}/api/cron/rebuild-sitemap-cache?phase=${phase}`;

    console.log(`[cron] Self-invoking phase ${phase} at ${url}...`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    });

    const body = await res.json().catch(() => ({}));
    console.log(
      `[cron] Phase ${phase} response: HTTP ${res.status} —`,
      JSON.stringify(body).slice(0, 200)
    );
  } catch (err) {
    console.error(
      `[cron] Failed to self-invoke phase ${phase}:`,
      (err as Error).message
    );
  }
}

// ── Route Handler ─────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<Response> {
  // ── Auth check ──
  if (!isAuthorized(request)) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const phaseParam = searchParams.get("phase");
  const phase = phaseParam ? parseInt(phaseParam, 10) : 0;
  const now = getLastmodWIB();

  try {
    // ── Phase 0: HANYA trigger — tidak await apa pun ──
    if (phase === 0) {
      console.log("[cron] Phase 0: Triggering all phases via self-invoke...");

      // Jangan await — fire-and-forget semua phase dengan jeda 100ms
      // agar tidak overwhelm server dan tidak kena 60s timeout
      // Panggil semua sebelum return, tanpa setTimeout
selfInvoke(1).catch((err) => console.error("[cron] phase 1 failed:", err));
selfInvoke(2).catch((err) => console.error("[cron] phase 2 failed:", err));
selfInvoke(3).catch((err) => console.error("[cron] phase 3 failed:", err));

return Response.json({ success: true, phase: 0, message: "All phases triggered." });
    }

    // ── Phase 1: Fetch anime (ongoing + completed) ──
    if (phase === 1) {
      await executePhase1(now);
      return Response.json({
        success: true,
        phase: 1,
        message: "Anime cache rebuilt successfully.",
      });
    }

    // ── Phase 2: Fetch movies ──
    if (phase === 2) {
      await executePhase2(now);
      return Response.json({
        success: true,
        phase: 2,
        message: "Movies cache rebuilt successfully.",
      });
    }

    // ── Phase 3: Fetch episodes + Ping Google ──
    if (phase === 3) {
      await executePhase3(now);
      return Response.json({
        success: true,
        phase: 3,
        message: "Episodes cache rebuilt + Google ping sent.",
      });
    }

    // ── Unknown phase ──
    return Response.json(
      { success: false, message: `Unknown phase: ${phase}` },
      { status: 400 }
    );
  } catch (err) {
    const message = (err as Error).message;
    console.error(`[cron] Phase ${phase} error:`, message);
    return Response.json(
      { success: false, phase, message: `Error: ${message}` },
      { status: 500 }
    );
  }
}

// ── Phase Executors ───────────────────────────────────────────────────

async function executePhase1(now: string): Promise<void> {
  console.log("[cron] Phase 1: Fetching all anime...");
  const animeList = await fetchAllAnime();
  await saveCache("anime-list.json", animeList, now);
}

async function executePhase2(now: string): Promise<void> {
  console.log("[cron] Phase 2: Fetching all movies...");
  const moviesList = await fetchAllMovies();
  await saveCache("movies-list.json", moviesList, now);
}

async function executePhase3(now: string): Promise<void> {
  console.log("[cron] Phase 3: Fetching all episodes...");
  const episodesList = await fetchAllEpisodes();
  await saveCache("watch-list.json", episodesList, now);

  // Ping Google untuk memberitahu sitemap baru
  console.log("[cron] Pinging Google sitemap...");
  try {
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(
      BASE_URL + "/sitemap-index"
    )}`;
    const res = await fetch(pingUrl, { method: "GET" });
    console.log(
      `[cron] Google ping response: HTTP ${res.status} ${res.statusText}`
    );
  } catch (err) {
    // Ping Google gagal bukan critical error — jangan throw
    console.log(
      "[cron] Google ping failed (non-critical):",
      (err as Error).message
    );
  }
}

/**
 * Vercel Free plan:
 *   - Cron function: max 10 detik (hanya Phase 0 yang dipanggil cron)
 *   - Non-cron function: max 60 detik (Phase 1, 2, 3 dipanggil via self-invoke HTTP)
 *   - Kita set maxDuration = 60 untuk semua, karena Phase 0 sendiri selesai < 1 detik
 *     dan sisanya butuh ~90 detik (Phase 1) / ~35 detik (Phase 3).
 */
export const maxDuration = 60;