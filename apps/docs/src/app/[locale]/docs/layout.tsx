import { baseOptions } from '@/config/layout.config'
import { T3M4 } from '@/lib/T3M4'
import { basehub } from 'basehub'
import { Icon } from 'basehub/react-svg'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ComponentProps, PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  const { docs } = await basehub().query({ docs: { articles: { items: { slug: true, category: { _title: true, _slug: true, folder: true, root: true, icon: true, url: true }, icon: true, _title: true } } } })

  const getTree = (articles: typeof docs.articles.items) => {
    const groupedByCat = articles.reduce(
      (acc, article) => {
        if (!acc[article.category._title]) acc[article.category._title] = { category: article.category, articles: [] } as (typeof acc)[typeof article.category._title]
        acc[article.category._title].articles.push(article)
        return acc
      },
      {} as Record<string, { category: (typeof docs.articles.items)[0]['category']; articles: Omit<(typeof docs.articles.items)[0], 'category'>[] }>
    )

    type Tree = ComponentProps<typeof DocsLayout>['tree']['children']
    const result: Tree = []

    for (const [cat, { category, articles }] of Object.entries(groupedByCat)) {
      if (!category?.folder) {
        result.push({ type: 'separator', name: cat })
        articles.forEach((article) =>
          result.push({
            type: 'page',
            name: article._title,
            url: `/docs${article.slug}`,
            icon: article.icon ? <Icon content={article.icon} components={{ svg: (props) => <svg {...props} /> }} /> : undefined,
          })
        )
        continue
      }

      if (category.folder) {
        result.push({
          type: 'folder',
          root: category.root,
          name: cat,
          icon: category.icon ? <Icon content={category.icon} components={{ svg: (props) => <svg {...props} data-facet-color={category._slug as T3M4['root']['facets']['color']} className='text-fd-primary' /> }} /> : undefined,
          children: articles.map((item) => ({
            type: 'page',
            name: item._title,
            url: `/docs${item.slug}`,
            icon: item.icon ? <Icon content={item.icon} components={{ svg: (props) => <svg {...props} data-facet-color={category._slug as T3M4['root']['facets']['color']} /> }} /> : undefined,
          })),
        })
        continue
      }

      continue
    }

    return result
  }

  return (
    <DocsLayout tree={{ name: 'docs', children: getTree(docs.articles.items) }} {...await baseOptions()}>
      {children}
    </DocsLayout>
  )
}
