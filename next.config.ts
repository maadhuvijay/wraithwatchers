import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid parsing errors
  productionBrowserSourceMaps: false,
  // Ensure proper source map handling
  webpack: (config, { dev, isServer }) => {
    // Use proper source map generation in development
    if (dev) {
      config.devtool = 'eval-source-map';
    } else if (!isServer) {
      // Disable source maps in production builds
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
