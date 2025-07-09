import { baseOptions } from '../../../../fumadocs.config'
import { ArticleSlugFragmentRecursive } from '@/helpers/basehub/fragments'
import { getTree } from '@/helpers/basehub/tree'
import { basehub } from 'basehub'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  const { docs } = await basehub().query({
    docs: { items: ArticleSlugFragmentRecursive },
  })

  return (
    <DocsLayout tree={{ name: 'docs', children: getTree(docs.items) }} {...await baseOptions()}>
      {children}
    </DocsLayout>
  )
}
