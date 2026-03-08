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
        hostname: "www.sankavollerei.com",
      },
      {
        protocol: "https",
        hostname: "objects.nyomo.my.id",
        pathname: "/**",
      },
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
