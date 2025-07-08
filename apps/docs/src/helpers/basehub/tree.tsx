import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { ComponentProps } from 'react'
import { ArticleSlugFragmentRecursive } from './fragments'
import { Icon } from 'basehub/react-icon'

type Tree = ComponentProps<typeof DocsLayout>['tree']['children']

export function getTree(articles: ArticleSlugFragmentRecursive[]): Tree {
  const basePath = ['docs']
  const tree: Tree = []

  articles.forEach((article) => {
    const articlePath = [...basePath, article._slug]

    if (!article.children.items.length) {
      const last = tree.at(-1)
      if (last) tree.push({ type: 'separator' })
      
      tree.push({ type: 'page', name: article._title, url: `/${articlePath.join('/')}`, icon: article.icon ? <Icon content={article.icon} /> : undefined })
    } else {
      tree.push({ type: 'separator', name: article._title, icon: article.icon ? <Icon content={article.icon} /> : undefined })
      article.children.items.forEach((child) => {
        const childPath = [...articlePath, child._slug]

        if (!child.children.items.length) tree.push({ type: 'page', name: child._title, url: `/${childPath.join('/')}`, icon: child.icon ? <Icon content={child.icon} /> : undefined })
        else {
          tree.push({
            type: 'folder',
            name: child._title,
            icon: child.icon ? <Icon content={child.icon} /> : undefined,
            root: child.root,
            children: child.children.items.map((grandChild) => {
              const grandChildPath = [...childPath, grandChild._slug]

              return {
                type: 'page',
                name: grandChild._title,
                url: `/${grandChildPath.join('/')}`,
                icon: grandChild.icon ? <Icon content={grandChild.icon} /> : undefined,
              }
            }),
          })
        }
      })
    }
  })

  return tree
}
