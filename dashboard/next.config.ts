import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from these external domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "newsapi.org" },
    ],
  },
};

export default nextConfig;
