import { AccordionsComponent } from '@/components/article/Accordions'
import { CalloutComponent } from '@/components/article/Callout'
import { CardComponent } from '@/components/article/Card'
import { CardsComponent } from '@/components/article/Cards'
import { CodeBlockComponent } from '@/components/article/CodeBlock'
import { CodeBlockTabsComponent } from '@/components/article/CodeBlockTabs'
import { TabsComponent } from '@/components/article/Tabs'
import { flattenArticlesPaths, getArticleBySlug } from '@/helpers/basehub/article'
import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive } from '@/helpers/basehub/fragments'
import { Link, redirect } from '@/lib/next-intl/navigation'
import { basehub } from 'basehub'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { getTableOfContents } from 'fumadocs-core/server'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

export const dynamic = 'force-static'

interface Props {
  params: Promise<{ slugs?: string[]; locale: Locale }>
}

export const generateStaticParams = async () => {
  const { site } = await basehub().query({
    site: {
      docs: {
        items: ArticleSlugFragmentRecursive,
      },
    },
  })

  return flattenArticlesPaths(site.docs.items)
}

export default async function Page(props: Props) {
  const { locale, slugs } = await props.params

  setRequestLocale(locale)

  if (!slugs || !slugs.length) return redirect({ href: '/docs/introduction', locale })

  return (
    <Pump draft={(await draftMode()).isEnabled} queries={[{ site: { docs: { item: ArticleFragmentRecursive, __args: { filter: { _sys_slug: { eq: slugs.at(0) } } } } } }]} bind={{ slug: `/${slugs.join('/')}` }}>
      {async ({ slug }, [{ site }]) => {
        'use server'

        if (!site.docs.item) return notFound()

        const article = getArticleBySlug(site.docs.item, slug)
        if (!article) return notFound()

        const toc = getTableOfContents(article.body?.markdown ?? '')

        return (
          <DocsPage toc={toc} lastUpdate={site.docs.item._sys.lastModifiedAt}>
            <DocsTitle>{article?._title}</DocsTitle>
            <DocsDescription>{article?.excerpt}</DocsDescription>
            <DocsBody>
              <RichText
                blocks={article.body?.json.blocks}
                components={{
                  a: (props) => <Link {...props} />,
                  pre: ({ code, language, ...props }) => (
                    <Suspense>
                      <CodeBlockComponent code={{ code, language }} {...props} />
                    </Suspense>
                  ),
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                  CardComponent,
                  CardsComponent,
                  AccordionsComponent,
                  CalloutComponent,
                  TabsComponent,
                  CodeBlockTabsComponent,
                  CodeBlockComponent,
                }}
                content={article?.body?.json.content}
              />
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
