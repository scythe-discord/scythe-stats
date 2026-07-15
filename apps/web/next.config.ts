import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: 'standalone',
  // Trace workspace deps from the monorepo root into the standalone output.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  // Internal workspace packages are shipped as TypeScript source.
  transpilePackages: ['@scythe/db', '@scythe/domain', '@scythe/config'],
  // Faction/mat art is small static PNGs — skip the optimizer
  images: { unoptimized: true },
  // scythestats.com (and both www hosts) are alias domains pointed at the same
  // app; send them to the canonical apex, preserving path and query.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?:www\\.)?scythestats\\.com' }],
        destination: 'https://belovedpacifist.com/:path*',
        permanent: false,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www\\.belovedpacifist\\.com' }],
        destination: 'https://belovedpacifist.com/:path*',
        permanent: false,
      },
    ];
  },
};

export default config;
