import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ComponentProps } from 'react'
import { ArticleSlugFragmentRecursive } from './fragments'
import { Icon } from 'basehub/react-icon'

type Tree = ComponentProps<typeof DocsLayout>['tree']['children']

export function getTree(articles: ArticleSlugFragmentRecursive[]): Tree {
  const basePath = ['docs']

  function buildTree(items: ArticleSlugFragmentRecursive[], currentPath: string[] = [], level = 0): Tree {
    const result: Tree = []

    for (const item of items) {
      const itemPath = [...currentPath, item._slug]
      const icon = item.icon ? <Icon content={item.icon} /> : undefined
      const hasChildren = item.children.items.length > 0

      if (!hasChildren) {
        result.push({
          type: 'page',
          name: item._title,
          url: `/${itemPath.join('/')}`,
          icon,
        })
      } else {
        const base = {
          name: item._title,
          icon,
        }

        if (level === 0) {
          result.push({
            type: 'separator',
            ...base,
          })

          const children = buildTree(item.children.items, itemPath, level + 1)
          result.push(...children)
        } else {
          const children = buildTree(item.children.items, itemPath, level + 1)

          result.push({
            type: 'folder',
            ...base,
            root: item.root,
            children,
          })
        }
      }
    }

    return result
  }

  return buildTree(articles, basePath)
}
