import type { NextConfig } from "next";
import redirectsList from "./data/redirects.json";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    const binaryModels = [
      '/models/robopengu-motion-1dcdbbc49c6b.glb.gz',
      '/models/robopengu-desktop-lossless-e487f79e706b.glb.gz',
      '/models/robopengu-mobile-feda5b385835.glb.gz',
      '/models/robopengu-mobile-lossless-246c09dcc8a3.glb.gz',
    ].map(source => ({
      source,
      headers: [
        { key: 'Content-Encoding', value: 'gzip' },
        { key: 'Content-Type', value: 'model/gltf-binary' },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    }));
    const desktopBase = '/models/robopengu-desktop-5c9e2e8c3aa8/';
    return [...binaryModels, ...[
      ['scene.gltf', 'model/gltf+json'],
      ['texture-0-6758289a8110.jpg', 'image/jpeg'],
      ['texture-1-4e510b79135a.jpg', 'image/jpeg'],
      ['texture-2-f8d9715f1429.jpg', 'image/jpeg'],
      ['geometry-84273364f678.bin.gz', 'application/octet-stream'],
    ].map(([file, type]) => ({
      source: `${desktopBase}${file}`,
      headers: [
        { key: 'Content-Type', value: type },
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ...(file.endsWith('.gz') ? [{ key: 'Content-Encoding', value: 'gzip' }] : []),
      ],
    }))];
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
