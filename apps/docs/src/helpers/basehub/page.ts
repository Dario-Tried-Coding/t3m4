import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive } from './fragments'

export const getArticleBySlug = (article: ArticleFragmentRecursive, targetPath: string, currentPath: string[] = []): ArticleFragmentRecursive | undefined => {
  const newPath = [...currentPath, article._slug]
  const fullPath = `/${newPath.join('/')}`

  if (fullPath === targetPath) return article

  if (article.children?.items.length) {
    for (const child of article.children.items) {
      const found = getArticleBySlug(child, targetPath, newPath)
      if (found) return found
    }
  }

  return undefined
}

export const flattenArticlesPaths = (articles: ArticleSlugFragmentRecursive[], parentPath: string[] = []): { slug: string[] }[] => {
  const result: { slug: string[] }[] = []

  for (const article of articles) {
    const currentPath = [...parentPath, article._slug]
    result.push({ slug: currentPath })

    if (article.children?.items.length) {
      result.push(...flattenArticlesPaths(article.children.items, currentPath))
    }
  }

  return result
}
