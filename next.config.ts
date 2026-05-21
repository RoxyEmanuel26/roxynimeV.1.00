import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Security & Performance ──
  poweredByHeader: false,    // Hide "X-Powered-By: Next.js" header
  compress: true,            // Enable gzip compression

  // ── Dev Logging ──
  logging: {
    fetches: {
      fullUrl: true,         // Log full fetch URLs in dev mode
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api-cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myanimelist.net",
        pathname: "/**",
      },
      // Otakudesu domains (changes periodically)
      {
        protocol: "https",
        hostname: "otakudesu.best",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "otakudesu.blog",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.otakudesu.best",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.otakudesu.best",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.otakudesu.blog",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.otakudesu.blog",
        pathname: "/**",
      },
      // Samehadaku
      {
        protocol: "https",
        hostname: "v2.samehadaku.how",
        pathname: "/wp-content/uploads/**",
      },

      // WordPress CDN (used by Samehadaku poster images)
      {
        protocol: "https",
        hostname: "i0.wp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i1.wp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i2.wp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i3.wp.com",
        pathname: "/**",
      },
      // Sanka Vollerei (API host)
      {
        protocol: "https",
        hostname: "www.sankavollerei.com",
      },
      // Nyomo CDN
      {
        protocol: "https",
        hostname: "objects.nyomo.my.id",
        pathname: "/**",
      },
      // [SECURITY FIX] Google avatars — wildcard dipersempit ke subdomain spesifik
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400, // 24 hours
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  async rewrites() {
    return [
      {
        source: "/sitemap_anime_:id.xml",
        destination: "/api/sitemap/anime/:id",
      },
      {
        source: "/sitemap_movies_:id.xml",
        destination: "/api/sitemap/movies/:id",
      },
      {
        source: "/sitemap_watch_:id.xml",
        destination: "/api/sitemap/watch/:id",
      },
    ];
  },

  // ── Security Headers (improves Lighthouse + SEO) ──
  // [SECURITY FIX] 21 Mei 2026 — Tambah CSP, X-Robots-Tag, perkuat Permissions-Policy
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // [SECURITY FIX] Permissions-Policy diperluas
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // [SECURITY FIX] Content-Security-Policy ditambahkan (Disesuaikan agar iklan dinamis & video player embed berjalan lancar)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src * data: blob:",
              "connect-src 'self' https: http: data: blob:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
      {
        // Aggressive cache for static assets
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // [SECURITY FIX] Blokir search engine dari indexing API routes
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
