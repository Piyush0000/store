import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'd1311wbk6unapo.cloudfront.net' },
    ],
    qualities: [70, 75, 80],
  },
  compress: true,
};

export default nextConfig;
