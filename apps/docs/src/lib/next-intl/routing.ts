import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  defaultLocale: 'it',
  locales: ['en', 'it'],
  localePrefix: 'never',
})
