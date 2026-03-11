import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@rzf/shared'],
  // Suppress "multiple lockfiles" warning in monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.sleeper.app' },
    ],
  },
}

export default nextConfig
