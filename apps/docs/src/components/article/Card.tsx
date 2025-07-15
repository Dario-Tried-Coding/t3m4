import { fragmentOn } from 'basehub'
import { Icon } from 'basehub/react-icon'
import { Card, CardProps } from 'fumadocs-ui/components/card'

export const CardFragment = fragmentOn('CardComponent', { _title: true, icon: true, url: true, description: { plainText: true } })
export type CardFragment = fragmentOn.infer<typeof CardFragment>

type Props = Omit<CardProps, 'title' | keyof CardFragment> & CardFragment
export const CardComponent = ({ _title, description, icon, url, ...props }: Props) => (
  <Card title={_title} description={description?.plainText} icon={icon ? <Icon content={icon} /> : undefined} href={url ?? undefined} {...props} />
)
