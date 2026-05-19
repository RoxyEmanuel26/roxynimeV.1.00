/**
 * route.ts - /api/cron/rebuild-sitemap-cache
 * Cron endpoint untuk rebuild sitemap cache.
 * Dipanggil oleh Vercel Cron 1x/hari (jam 01:00 WIB).
 * Menggunakan phase-based execution untuk mengakali Vercel Free 10s limit.
 * Dibuat: 20 Mei 2026
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

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Validasi cron secret dari request.
 * Return true jika authorized.
 */
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Jika CRON_SECRET tidak diset (dev mode), izinkan akses
    console.warn("[cron] CRON_SECRET not set — allowing all requests (dev mode)");
    return true;
  }

  const authHeader = request.headers.get(AUTH_HEADER) ?? "";
  const expected = `Bearer ${cronSecret}`;
  const isValid = authHeader === expected;

  if (!isValid) {
    console.error("[cron] Unauthorized request — wrong or missing Authorization header");
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
    // ── Phase 0: Trigger all phases sequentially via self-invoke ──
    if (phase === 0) {
      console.log("[cron] Phase 0: Initiating cascade...");

      // Phase 1 langsung dijalankan di request ini
      await executePhase1(now);

      // Phase 2 dan 3 di-trigger async (jangan await agar tidak ngeblok 10s limit)
      // Gunakan waitUntil jika tersedia (Vercel), atau langsung fire-and-forget
      selfInvoke(2).catch((err) =>
        console.error("[cron] Self-invoke phase 2 failed:", err)
      );
      selfInvoke(3).catch((err) =>
        console.error("[cron] Self-invoke phase 3 failed:", err)
      );

      return Response.json({
        success: true,
        phase: 0,
        message:
          "Phase 1 complete. Phase 2 & 3 triggered async (self-invoke).",
      });
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
 * Vercel Free hanya bisa 10 detik. 
 * Phase 1, 2, 3 masing-masing dijalankan di INVOKASI TERPISAH.
 * Phase 0 hanya trigger, bukan menjalankan semua phase dalam 1 request.
 */
export const maxDuration = 10;