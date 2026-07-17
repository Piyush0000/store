import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.evoclabs.com",
    "localhost:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "d1311wbk6unapo.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
