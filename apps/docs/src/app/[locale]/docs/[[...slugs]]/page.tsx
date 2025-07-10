import { CopyMarkdown } from '@/components/CopyMarkdown'
import { LastUpdated } from '@/components/LastUpdated'
import { OpenInBtn } from '@/components/OpenInBtn'
import { Rate } from '@/components/Rate'
import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive } from '@/helpers/basehub/fragments'
import { flattenArticlesPaths, getArticleBySlug } from '@/helpers/basehub/page'
import { redirect } from '@/lib/next-intl/navigation'
import { basehub } from 'basehub'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { getTableOfContents } from 'fumadocs-core/server'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

export const generateStaticParams = async () => {
  const { docs } = await basehub().query({
    docs: {
      items: ArticleSlugFragmentRecursive,
    },
  })

  return flattenArticlesPaths(docs.items)
}

interface Props {
  params: Promise<{ slugs?: string[]; locale: Locale }>
}
export default async function Page(props: Props) {
  const { locale, slugs } = await props.params

  setRequestLocale(locale)

  if (!slugs || !slugs.length) return redirect({ href: '/docs/introduction', locale })

  return (
    <Pump queries={[{ docs: { item: ArticleFragmentRecursive, __args: { filter: { _sys_slug: { eq: slugs.at(0) } } } } }]} bind={{ slug: `/${slugs.join('/')}` }}>
      {async ({ slug }, [{ docs }]) => {
        'use server'

        if (!docs.item) return notFound()

        const article = getArticleBySlug(docs.item, slug)
        if (!article) return notFound()

        const toc = getTableOfContents(article.body?.markdown ?? '')

        return (
          <DocsPage toc={toc} tableOfContent={{ single: false }}>
            <DocsTitle>{article?._title}</DocsTitle>
            <DocsDescription className='mb-0'>{article?.excerpt}</DocsDescription>
            <div className='flex gap-2'>
              <CopyMarkdown />
              <OpenInBtn />
            </div>
            <hr />
            <DocsBody>
              <RichText
                components={{
                  pre: ({ code, language }) => <DynamicCodeBlock code={code} lang={language} />,
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                }}
                content={article?.body?.json.content}
              />
              <Rate />
              {article?._sys.lastModifiedAt && <LastUpdated date={article._sys.lastModifiedAt} />}
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
