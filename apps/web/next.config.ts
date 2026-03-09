import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@rzf/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.sleeper.app' },
    ],
  },
}

export default nextConfig
