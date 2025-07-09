import { Link } from '@/lib/next-intl/navigation'
import { RichText } from 'basehub/react-rich-text'
import { ComponentProps } from 'react'

type RichTextComponents = ComponentProps<typeof RichText<[]>>['components']

export const customComponents: Partial<RichTextComponents> = {
  a: (props) => <Link {...props} />,
}