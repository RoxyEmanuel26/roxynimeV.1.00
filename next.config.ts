import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Samehadaku
      {
        protocol: "https",
        hostname: "v2.samehadaku.how",
        pathname: "/wp-content/uploads/**",
      },
      // Donghua (Anichin)
      {
        protocol: "https",
        hostname: "anichin.cafe",
        pathname: "/wp-content/uploads/**",
      },
      // Anoboy
      {
        protocol: "https",
        hostname: "anoboy.be",
        pathname: "/wp-content/uploads/**",
      },
      // Kuramanime
      {
        protocol: "https",
        hostname: "kuramanime.dad",
        pathname: "/**",
      },
      // Oploverz
      {
        protocol: "https",
        hostname: "oploverz.top",
        pathname: "/wp-content/uploads/**",
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
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
