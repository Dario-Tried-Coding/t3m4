import { CopyMarkdown } from '@/components/CopyMarkdown'
import { OpenInBtn } from '@/components/OpenInBtn'
import { buildToc } from '@/helpers/toc'
import { customComponents } from '@/lib/basehub'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { highlight } from 'fumadocs-core/highlight'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import * as Base from 'fumadocs-ui/components/codeblock'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { draftMode } from 'next/headers'

export interface CodeBlockProps {
  code: string
  wrapper?: Base.CodeBlockProps
  lang: string
}
async function CodeBlock({ code, lang, wrapper }: CodeBlockProps) {
  const rendered = await highlight(code, {
    lang,
    components: {
      pre: Base.Pre,
    },
  })

  return <Base.CodeBlock {...wrapper}>{rendered}</Base.CodeBlock>
}

interface Props {
  params: Promise<{ slug?: string[]; locale: Locale }>
}
export default async function Page(props: Props) {
  const { slug, locale } = await props.params

  return (
    <Pump
      draft={(await draftMode()).isEnabled}
      queries={[
        {
          docs: {
            articles: {
              item: {
                _title: true,
                title: true,
                excerpt: true,
                body: {
                  json: {
                    content: true,
                    toc: true,
                    blocks: {
                      on_CalloutComponent: {
                        _id: true,
                        __typename: true,
                        title: true,
                        body: { json: { content: true } },
                        type: true,
                      },
                      on_TabsComponent: {
                        _id: true,
                        __typename: true,
                        tabs: {
                          items: {
                            _id: true,
                            title: true,
                            body: { code: true, language: true },
                          },
                        },
                      },
                      on_CardsComponent: {
                        _id: true,
                        __typename: true,
                        cards: {
                          items: {
                            link: true,
                            instance: {
                              _id: true,
                              title: true,
                              description: { json: { content: true } },
                              color: true,
                              icon: true,
                              href: true,
                            },
                          },
                        },
                      },
                      on_ReferenceComponent: {
                        _id: true,
                        __typename: true,
                        reference: {
                          _id: true,
                          title: true,
                          description: { json: { content: true } },
                          icon: true,
                          href: true,
                        },
                      },
                      on_CodeBlockComponent: {
                        _id: true,
                        __typename: true,
                        title: true,
                        icon: true,
                        code: { language: true, code: true },
                      },
                    },
                  },
                },
              },
              __args: { filter: { slug: { eq: slug ? `/docs/${slug.join('/')}` : '/docs' } }, variants: { languages: locale } },
            },
          },
        },
      ]}
    >
      {async ([{ docs }]) => {
        'use server'

        const article = docs.articles.item
        const toc = buildToc(article?.body.json.toc ?? [])

        return (
          <DocsPage toc={toc}>
            <DocsTitle>{article?.title}</DocsTitle>
            <DocsDescription className='mb-0'>{article?.excerpt}</DocsDescription>
            <div className='flex gap-2'>
              <CopyMarkdown />
              <OpenInBtn />
            </div>
            <hr />
            <DocsBody>
              <RichText
                blocks={article?.body.json.blocks}
                components={{
                  pre: ({ code, language }) => <DynamicCodeBlock code={code} lang={language} />,
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                  CardsComponent: ({ _id, cards }) => {
                    const colors: Record<NonNullable<(typeof cards.items)[0]['instance']['color']>, string> = {
                      blue: 'text-blue-300',
                      green: 'text-green-300',
                      purple: 'text-purple-300',
                    }

                    return (
                      <Cards key={_id}>
                        {cards.items.map(({ link, instance: { _id, title, description, color, href, icon } }) => (
                          <Card key={_id} title={title} href={link ? href : undefined} icon={icon ? <span className={color ? colors[color] : undefined} dangerouslySetInnerHTML={{ __html: icon }} /> : undefined}>
                            <RichText>{description?.json.content}</RichText>
                          </Card>
                        ))}
                      </Cards>
                    )
                  },
                  CalloutComponent: ({ _title, body, type }) => {
                    return (
                      <Callout type={type ?? undefined} title={_title}>
                        <RichText components={customComponents}>{body?.json.content}</RichText>
                      </Callout>
                    )
                  },
                  TabsComponent: ({ tabs, persistent }) => {
                    return (
                      <Tabs items={tabs.items.map((t) => t.title)} persist={persistent}>
                        {tabs.items.map(({ _id, title, body }) => (
                          <Tab key={_id} value={title}>
                            <DynamicCodeBlock code={body.code} lang={body.language} />
                          </Tab>
                        ))}
                      </Tabs>
                    )
                  },
                  CodeBlockComponent: ({ icon, title, code: { code, language } }) => <CodeBlock code={code} lang={language} wrapper={{ title: title, icon: icon ? <span dangerouslySetInnerHTML={{ __html: icon }} /> : undefined }} />,
                }}
                content={article?.body.json.content}
              />
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
