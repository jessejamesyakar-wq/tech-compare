import type { NextConfig } from "next";
import redirectsList from "./data/redirects.json";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      '/models/robopengu-motion-1dcdbbc49c6b.glb.gz',
      '/models/robopengu-mobile-feda5b385835.glb.gz',
    ].map(source => ({
      source,
      headers: [
        { key: 'Content-Encoding', value: 'gzip' },
        { key: 'Content-Type', value: 'model/gltf-binary' },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    }));
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  },
  async redirects() {
    return redirectsList.map(({ source, destination, permanent }) => ({
      source,
      destination,
      permanent: permanent !== false,
    }));
  },
};

export default bundleAnalyzer(nextConfig);
