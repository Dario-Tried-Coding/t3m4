import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive, CardFragment, CardsFragment } from '@/helpers/basehub/fragments'
import { flattenArticlesPaths, getArticleBySlug } from '@/helpers/basehub/page'
import { redirect } from '@/lib/next-intl/navigation'
import { T3M4 } from '@/lib/T3M4'
import { cn } from '@/lib/utils'
import { basehub, fragmentOn } from 'basehub'
import { Icon } from 'basehub/react-icon'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { highlight } from 'fumadocs-core/highlight'
import { getTableOfContents } from 'fumadocs-core/server'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { CodeBlock, CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger, Pre } from 'fumadocs-ui/components/codeblock'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

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

        const highlightCode = async (code: string, language: string) => {
          const rendered = await highlight(code, {
            lang: language,
            components: {
              pre: (props) => <Pre {...props} />,
            },
          })

          return rendered
        }

        return (
          <DocsPage toc={toc} lastUpdate={site.docs.item._sys.lastModifiedAt}>
            <DocsTitle>{article?._title}</DocsTitle>
            <DocsDescription>{article?.excerpt}</DocsDescription>
            <DocsBody>
              <RichText
                blocks={article.body?.json.blocks}
                components={{
                  pre: async ({ code, language, ...props }) => {
                    const rendered = await highlightCode(code, language)
                    return <CodeBlock {...props}>{rendered}</CodeBlock>
                  },
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                  CardComponent: ({ _title, description, icon, url }) => <Card title={_title} description={description?.plainText} icon={icon ? <Icon content={icon} /> : undefined} href={url ?? undefined} />,
                  CardsComponent: (props) => {
                    const cards = [] as (fragmentOn.infer<typeof CardsFragment>['cards']['items'] | fragmentOn.infer<typeof CardFragment>)[]
                    let buffer = undefined as fragmentOn.infer<typeof CardsFragment>['cards']['items'] | undefined

                    const flushBuffer = () => {
                      if (buffer) cards.push(buffer)
                      buffer = undefined
                    }

                    props.cards.items.forEach((card) => {
                      if (card.single) {
                        flushBuffer()
                        cards.push(card)
                      } else {
                        if (buffer) buffer.push(card)
                        else buffer = [card]
                      }
                    })
                    flushBuffer()

                    return (
                      <>
                        {cards.map((i, index) => {
                          if (Array.isArray(i))
                            return (
                              <Cards key={index} className={cn(index < cards.length - 1 && 'mb-3')}>
                                {i.map(({ url, _id, _slug, _title, description, icon }) => (
                                  <Card
                                    key={_id}
                                    title={_title}
                                    description={description?.plainText}
                                    href={url ?? undefined}
                                    icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg {...props} data-facet-color={_slug as T3M4['root']['facets']['color']} className='text-fd-primary' /> }} /> : undefined}
                                  />
                                ))}
                              </Cards>
                            )

                          const { _id, _title, description, icon, url, _slug } = i

                          return (
                            <Card
                              key={_id}
                              title={_title}
                              description={description?.plainText}
                              href={url ?? undefined}
                              icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg {...props} data-facet-color={_slug as T3M4['root']['facets']['color']} className='text-fd-primary' /> }} /> : undefined}
                              className={cn(index < cards.length - 1 && 'mb-3')}
                            />
                          )
                        })}
                      </>
                    )
                  },
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
                  TabsComponent: ({ tabs }) => (
                    <Tabs items={tabs.items.map(({ _title }) => _title)}>
                      {tabs.items.map(({ _slug, _title, body }) => (
                        <Tab key={_slug} value={_title} title={_title}>
                          {body}
                        </Tab>
                      ))}
                    </Tabs>
                  ),
                  CodeBlockComponent: async ({ tabs }) => {
                    const codeBySlug = new Map<string, Awaited<ReturnType<typeof highlightCode>>>()
                    for (const { _slug, code: {code, language} } of tabs.items) {
                      const rendered = await highlightCode(code, language)
                      codeBySlug.set(_slug, rendered)
                    }

                    return (
                      <CodeBlockTabs defaultValue={tabs.items.at(0)?._slug}>
                        <CodeBlockTabsList>
                          {tabs.items.map(({ _slug, _title }) => (
                            <CodeBlockTabsTrigger key={_slug} value={_slug}>
                              {_title}
                            </CodeBlockTabsTrigger>
                          ))}
                        </CodeBlockTabsList>
                        {tabs.items.map(({ _slug, fileName, icon }) => {
                          return (
                            <CodeBlockTab key={_slug} value={_slug}>
                              <CodeBlock icon={icon ? <Icon content={icon} /> : undefined} title={fileName ?? undefined}>
                                <Pre>{codeBySlug.get(_slug)}</Pre>
                              </CodeBlock>
                            </CodeBlockTab>
                          )
                        })}
                      </CodeBlockTabs>
                    )
                  },
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
