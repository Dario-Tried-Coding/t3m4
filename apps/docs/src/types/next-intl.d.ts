import messages from '../i18n/en.json'
import { i18nRouting } from '@/lib/next-intl/routing'
import { formats } from '@/lib/next-intl/request'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof i18nRouting.locales)[number]
    Messages: typeof messages
    Formats: typeof formats
  }
}
