import createMiddleware from 'next-intl/middleware'
import { routing } from '@/lib/next-intl/routing'

export const i18nMiddleware = createMiddleware(routing)
