import { defineRouting } from "next-intl/routing";

export const i18nRouting = defineRouting({
  defaultLocale: 'it',
  locales: ['en', 'it'],
  localePrefix: 'never'
})