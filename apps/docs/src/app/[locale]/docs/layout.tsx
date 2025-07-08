import { baseOptions } from '@/config/layout.config'
import { articleFragment, constructTree } from '@/helpers/basehub'
import { basehub } from 'basehub'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  const { docs } = await basehub({}).query({
    docs: { items: { ...articleFragment } },
  })

  return (
    <DocsLayout tree={{ name: 'docs', children: constructTree(docs.items) }} {...await baseOptions()}>
      {children}
    </DocsLayout>
  )
}
