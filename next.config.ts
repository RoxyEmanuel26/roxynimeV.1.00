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
      // Google (user avatars)
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
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
};

export default nextConfig;
