import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [],
  // Suppress "multiple lockfiles" warning in monorepo
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default nextConfig
