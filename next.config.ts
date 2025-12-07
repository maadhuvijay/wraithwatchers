import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to avoid parsing errors
  productionBrowserSourceMaps: false,
  // Ensure proper source map handling
  webpack: (config, { dev, isServer }) => {
    // Use more reliable source map generation in development
    if (dev) {
      // Use 'cheap-module-source-map' for better compatibility
      config.devtool = 'cheap-module-source-map';
    } else {
      // Disable source maps in production builds
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
