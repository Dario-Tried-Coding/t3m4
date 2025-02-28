import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { withContentCollections } from '@content-collections/next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
}

const withNextIntl = createNextIntlPlugin('./src/lib/next-intl/request.ts')

export default withContentCollections(withNextIntl(nextConfig))