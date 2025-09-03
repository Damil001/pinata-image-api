import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle PDF.js and other Node.js modules in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
        crypto: false,
        util: false,
        buffer: false,
        process: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }

    // Additional configuration for PDF.js
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        canvas: 'canvas',
      });
    }

    // Handle PDF.js module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.entry.js',
    };

    // Ignore canvas module during build
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack')).IgnorePlugin({
        resourceRegExp: /^canvas$/,
        contextRegExp: /pdfjs-dist/,
      })
    );

    return config;
  },
  // Ensure proper handling of PDF.js worker
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
