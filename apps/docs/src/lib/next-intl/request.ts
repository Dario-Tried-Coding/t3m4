import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { i18nRouting } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(i18nRouting.locales, requested) ? requested : i18nRouting.defaultLocale

  return {
    locale,
    messages: (await import(`../../i18n/${locale}.json`)).default,
  }
})
