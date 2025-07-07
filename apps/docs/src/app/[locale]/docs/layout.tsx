import { baseOptions } from '@/config/layout.config'
import { T3M4 } from '@/lib/T3M4'
import { basehub } from 'basehub'
import { Icon } from 'basehub/react-svg'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { draftMode } from 'next/headers'
import { ComponentProps, PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  const { docs } = await basehub({ draft: (await draftMode()).isEnabled }).query({
    docs: { articles: { items: { _title: true, _slug: true, icon: true, children: { items: { _title: true, _slug: true, icon: true, root: true, children: { items: { _title: true, _slug: true, icon: true } } } } } } },
  })

  const getTree = () => {
    type Tree = ComponentProps<typeof DocsLayout>['tree']['children']
    const result: Tree = []

    for (const { _title, _slug, children, icon } of docs.articles.items) {
      if (children.items.length > 0) {
        result.push({ type: 'separator', name: _title, icon: icon ? <Icon content={icon} /> : undefined })
        children.items.forEach(({ _title, _slug: _artSlug, icon, root, children }) => {
          if (children.items.length > 0) {
            result.push({
              type: 'folder',
              name: _title,
              root,
              icon: icon ? <Icon content={icon} /> : undefined,
              children: children.items.map(({}) => ({
                type: 'page',
                name: _title,
                url: `/docs/${_slug}/${_artSlug}`,
                icon: icon ? <Icon content={icon} /> : undefined,
              })),
            })
          } else {
            result.push({
              type: 'page',
              name: _title,
              url: `/docs/${_slug}/${_artSlug}`,
              icon: icon ? <Icon content={icon} /> : undefined,
            })
          }
        })
      } else {
        result.push({
          type: 'page',
          name: _title,
          url: `/docs/${_slug}`,
        })
      }
    }

    return result
  }

  return (
    <DocsLayout tree={{ name: 'docs', children: getTree() }} {...await baseOptions()}>
      {children}
    </DocsLayout>
  )
}
