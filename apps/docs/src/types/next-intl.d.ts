import messages from '../i18n/en.json'
import { routing } from '@/lib/next-intl/routing'
import { formats } from '@/lib/next-intl/request'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
    Formats: typeof formats
  }
}
