import { baseOptions } from '@/config/layout.config'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <DocsLayout
      tree={{ name: 'T3M4', children: [{ type: 'folder', name: 'Folder', root: true, children: [{ type: 'page', name: 'Page', url: '/docs/folder/page' }] }] }}
      {...await baseOptions()}
      links={[{ type: 'main', text: 'Core concepts', url: '/docs/core-concepts' }]}
    >
      {children}
    </DocsLayout>
  )
}
