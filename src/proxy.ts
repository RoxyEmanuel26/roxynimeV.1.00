/**
 * middleware.ts
 * Safety net — memblokir semua route auth yang sudah di-decommission.
 * Mengembalikan 410 Gone (bukan 404) agar bot/crawler tahu endpoint ini
 * sudah dihapus secara permanen.
 *
 * [SECURITY FIX] Dibuat: 21 Mei 2026
 */

import { NextRequest, NextResponse } from "next/server";

/** Route yang sudah di-decommission dan tidak boleh diakses */
const DISABLED_ROUTES = [
  "/api/auth",
  "/api/favorites",
  "/api/history",
  "/auth",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDisabled = DISABLED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isDisabled) {
    return NextResponse.json(
      { error: "This endpoint has been permanently disabled." },
      { status: 410 } // 410 Gone — lebih tepat dari 404 untuk decommission
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/favorites/:path*",
    "/api/history/:path*",
    "/auth/:path*",
    "/profile/:path*",
  ],
};
