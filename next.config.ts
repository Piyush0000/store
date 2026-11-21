import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: [
    "*.evoclabs.com",
    "localhost:3000",
    "127.0.0.1:3000",
    "172.16.0.2:3000",
  ],
  images: {
    dangerouslyAllowLocalIP: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600],
    imageSizes: [32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    qualities: [70, 75, 80],
  },
  compress: true,
  async rewrites() {
    return [
      { source: "/combos", destination: "/offers" },
      { source: "/value-combo", destination: "/offers" },
      { source: "/value-combos", destination: "/offers" },
      { source: "/bundles", destination: "/offers" },
      { source: "/bundle", destination: "/offers" },
    ];
  },
};

export default nextConfig;
