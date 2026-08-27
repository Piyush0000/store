import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    "*.evoclabs.com",
    "localhost:3000",
    "127.0.0.1:3000",
    "172.16.0.2:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "api.evoclabs.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "d1311wbk6unapo.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "www.facebook.com",
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
