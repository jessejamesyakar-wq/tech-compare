import type { NextConfig } from "next";
import redirectsList from "./data/redirects.json";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
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

export default nextConfig;
