import { NestedKeyOf } from 'next-intl'
import { JSX } from 'react'

type LinkConfig = {
  label: NestedKeyOf<IntlMessages['Navbar']['Links']>
  href: string
  showIn: ('header' | 'footer')[]
  disabled?: boolean
  external?: boolean
  newTab?: boolean
  icon?: JSX.Element
}

export const navLinks = [
  {
    label: 'docs',
    href: '/docs',
    showIn: ['header'],
  },
  {
    label: 'playground',
    href: '/playground',
    showIn: ['header'],
    disabled: true,
  },
] satisfies LinkConfig[]
