import { fragmentOn, fragmentOnRecursiveCollection } from 'basehub'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ComponentProps } from 'react'

export const slugsFragment = fragmentOnRecursiveCollection('ArticleComponent', { _slug: true }, { recursiveKey: 'children', levels: 3 })
export const articleFragment = fragmentOnRecursiveCollection(
  'ArticleComponent',
  {
    _title: true,
    _slug: true,
    excerpt: true,
    icon: true,
    body: {
      json: {
        content: true,
        blocks: {
          on_CalloutComponent: {
            _id: true,
            __typename: true,
            _title: true,
            body: { json: { content: true } },
            type: true,
          },
          on_TabsComponent: {
            _id: true,
            __typename: true,
            tabs: {
              items: {
                _id: true,
                _title: true,
                body: { code: true, language: true },
              },
            },
          },
          on_CardsComponent: {
            _id: true,
            __typename: true,
            cards: {
              items: {
                link: true,
                instance: {
                  _id: true,
                  _title: true,
                  _slug: true,
                  description: { json: { content: true } },
                  color: true,
                  icon: true,
                  href: true,
                },
              },
            },
          },
          on_CodeBlockComponent: {
            _id: true,
            __typename: true,
            _title: true,
            icon: true,
            code: { language: true, code: true },
          },
        },
      },
      markdown: true,
    },
    ogImage: { height: true, url: true, width: true },
    _sys: {
      lastModifiedAt: true,
    },
    children: {
      __args: {
        
      }
    }
  },
  { recursiveKey: 'children', levels: 3 }
)

export function normalizeArticles(nodes: fragmentOn.infer<typeof slugsFragment>[]): fragmentOn.infer<typeof slugsFragment>[] {
  const walk = (items: fragmentOn.infer<typeof slugsFragment>[], parentPath: string): fragmentOn.infer<typeof slugsFragment>[] =>
    items.map((item) => {
      const cleanSlug = item._slug.replace(/^\/+/, '')
      const newSlug = `${parentPath}/${cleanSlug}`

      return {
        ...item,
        _slug: newSlug,
        children: item.children ? { items: walk(item.children.items ?? [], newSlug) } : { items: [] },
      }
    })

  return walk(nodes, '/docs')
}

export const constructTree = (articles: fragmentOn.infer<typeof slugsFragment>[]) => {
  const normArticles = normalizeArticles(articles) as fragmentOn.infer<typeof articleFragment>[]

  return normArticles.reduce(
    (tree, article) => {
      if (article.children.items.length === 0) tree.push({ type: 'page', name: article._title, url: article._slug })
      else {
        tree.push({ type: 'separator', name: article._title })
        article.children.items.forEach((child) => {
          if (child.children.items.length === 0) tree.push({ type: 'page', name: child._title, url: child._slug })
          else tree.push({ type: 'folder', name: child._title, children: child.children.items.map((grandChild) => ({ type: 'page', name: grandChild._title, url: grandChild._slug })) })
        })
      }
      return tree
    },
    [] as ComponentProps<typeof DocsLayout>['tree']['children']
  )
}

export function findArticleBySlug(articles: fragmentOn.infer<typeof slugsFragment>[], slug: string): fragmentOn.infer<typeof slugsFragment> | undefined {
  const normArticles = normalizeArticles(articles)

  const recursivelyFind = (normArticles: fragmentOn.infer<typeof slugsFragment>[], slug: string): fragmentOn.infer<typeof slugsFragment> | undefined => {
    for (const article of normArticles) {
      if (article._slug === slug) return article
      else if (article.children.items.length > 0) return recursivelyFind(article.children.items, slug)
    }
    return undefined
  }
  return recursivelyFind(normArticles, slug)
}

export function flattenArticles(articles: fragmentOn.infer<typeof slugsFragment>[]): fragmentOn.infer<typeof slugsFragment>[] {
  const normArticles = normalizeArticles(articles)

  const result: fragmentOn.infer<typeof slugsFragment>[] = []

  function traverse(items: fragmentOn.infer<typeof slugsFragment>[]) {
    for (const item of items) {
      result.push(item)
      if (item.children?.items?.length) {
        traverse(item.children.items)
      }
    }
  }

  traverse(normArticles)
  return result
}
