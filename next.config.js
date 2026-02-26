/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable SWC compiler optimizations
  compiler: {
    emotion: true,
  },

  // Experimental features for faster builds
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Turbopack config (not used since we're using webpack)
    turbo: {
      resolveAlias: {
        '@blink-health/ui-tools': '@blink-health/ui-tools/dist/esm',
      },
    },
  },

  // Transpile ui-tools for better tree-shaking
  transpilePackages: ['@blink-health/ui-tools'],

  // Webpack optimizations (only used when NOT using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Speed up development builds (less aggressive to preserve HMR)
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        // Don't disable splitChunks - it's needed for HMR
      };

      // Improve file watching for macOS
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: /node_modules/,
      };

      // Better module resolution to prevent cache issues
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig


