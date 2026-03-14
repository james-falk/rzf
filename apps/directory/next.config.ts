import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@rzf/shared'],
  // Keep @rzf/db and prisma as external — bundling them strips the native engine binary
  serverExternalPackages: ['@prisma/client', '@rzf/db'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingIncludes: {
    '/**': [
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node',
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.sleeper.app' },
    ],
  },
}

export default nextConfig
