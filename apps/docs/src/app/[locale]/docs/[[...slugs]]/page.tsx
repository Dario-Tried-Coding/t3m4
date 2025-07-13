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
import { Card, Cards } from 'fumadocs-ui/components/card'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Callout } from 'fumadocs-ui/components/callout'
import { Icon } from 'basehub/react-icon'
import { T3M4 } from '@/lib/T3M4'

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
    <Pump queries={[{ site: { docs: { item: ArticleFragmentRecursive, __args: { filter: { _sys_slug: { eq: slugs.at(0) } } } } } }]} bind={{ slug: `/${slugs.join('/')}` }}>
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
                  pre: ({ code, language }) => <DynamicCodeBlock code={code} lang={language} />,
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                  CardsComponent: (props) => (
                    <Cards>
                      {props.cards.items.map(({ url, _id, _slug, _title, description, icon }) => (
                        <Card
                          key={_id}
                          title={_title}
                          description={description?.plainText}
                          href={url ?? undefined}
                          icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg {...props} data-facet-color={_slug as T3M4['root']['facets']['color']} className='text-fd-primary' /> }} /> : undefined}
                        />
                      ))}
                    </Cards>
                  ),
                  AccordionsComponent: ({ type, accordions }) => (
                    <Accordions type={type}>
                      {accordions.items.map(({ _slug, _title, body }) => (
                        <Accordion key={_slug} title={_title}>
                          {body}
                        </Accordion>
                      ))}
                    </Accordions>
                  ),
                  CalloutComponent: ({ type, title, body }) => (
                    <Callout title={title} type={type}>
                      <RichText content={body.json.content} />
                    </Callout>
                  ),
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
