import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignore type errors during build for compiling the mock architecture stably.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint checks during build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
