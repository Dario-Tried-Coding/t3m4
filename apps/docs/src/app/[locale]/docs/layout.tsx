import { baseOptions } from '../../../../fumadocs.config'
import { ArticleSlugFragmentRecursive } from '@/helpers/basehub/fragments'
import { getTree } from '@/helpers/basehub/tree'
import { basehub } from 'basehub'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { draftMode } from 'next/headers'
import { PropsWithChildren } from 'react'

export default async function Layout({ children }: PropsWithChildren) {
  const { site } = await basehub({ draft: (await draftMode()).isEnabled }).query({
    site: { docs: { items: ArticleSlugFragmentRecursive } },
  })

  return (
    <DocsLayout tree={{ name: 'docs', children: getTree(site.docs.items) }} {...await baseOptions()}>
      {children}
    </DocsLayout>
  )
}
