import { Pre } from 'fumadocs-ui/components/codeblock'
import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive } from './fragments'
import { highlight } from 'fumadocs-core/highlight'

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

export const flattenArticlesPaths = (articles: ArticleSlugFragmentRecursive[]): { slugs: string[] }[] => {
  const result: { slugs: string[] }[] = []

  const iterateArticles = (articles: ArticleSlugFragmentRecursive[], currentPath: string[] = []) => {
    for (const article of articles) {
      const newPath = [...currentPath, article._slug]
      result.push({ slugs: newPath })

      if (article.children?.items.length) iterateArticles(article.children.items, newPath)
    }
  }

  iterateArticles(articles)
  return result
}

export const highlightCode = async (code: string, language: string) => {
  const rendered = await highlight(code, {
    lang: language,
    components: {
      pre: (props) => <Pre {...props} />,
    },
  })

  return rendered
}