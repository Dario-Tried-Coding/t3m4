import { createNavigation } from 'next-intl/navigation'
import { i18nRouting } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(i18nRouting)