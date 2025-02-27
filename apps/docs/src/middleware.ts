import { i18nMiddleware } from './lib/next-intl/middleware'

export default i18nMiddleware

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}