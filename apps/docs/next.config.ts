import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

const withNextIntl = createNextIntlPlugin('./src/lib/next-intl/request.ts')

export default withNextIntl(nextConfig)