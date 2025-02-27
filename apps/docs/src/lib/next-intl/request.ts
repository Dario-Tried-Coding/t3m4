import { getRequestConfig } from 'next-intl/server'
import { i18nRouting } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !i18nRouting.locales.includes(locale as any)) {
    locale = i18nRouting.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default,
  }
})
