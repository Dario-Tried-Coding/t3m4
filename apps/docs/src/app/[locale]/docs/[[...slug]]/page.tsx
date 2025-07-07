import { CopyMarkdown } from '@/components/CopyMarkdown'
import { LastUpdated } from '@/components/LastUpdated'
import { OpenInBtn } from '@/components/OpenInBtn'
import { Rate } from '@/components/Rate'
import { customComponents } from '@/lib/basehub'
import { redirect } from '@/lib/next-intl/navigation'
import { T3M4 } from '@/lib/T3M4'
import { fragmentOn } from 'basehub'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { Icon } from 'basehub/react-svg'
import { highlight } from 'fumadocs-core/highlight'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import * as CodeBlock from 'fumadocs-ui/components/codeblock'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { draftMode } from 'next/headers'

interface Props {
  params: Promise<{ slug?: string[]; locale: Locale }>
}
export default async function Page(props: Props) {
  const { slug, locale } = await props.params

  setRequestLocale(locale)

  if (!slug) redirect({ href: '/docs/getting-started', locale })

  return (
    <Pump
      draft={(await draftMode()).isEnabled}
      queries={[
        {
          docs: {
            articles: {
              item: {
                _slugPath: true,
              },
              __args: { skip: 1}
              // __args: { filter: { _sys_slugPath: { eq: `root docs articles test nested-article` } } },
            },
          },
          // docs: {
          //   articles: {
          //     item: {
          //       _title: true,
          //       excerpt: true,
          //       body: {
          //         json: {
          //           content: true,
          //           toc: true,
          //           // blocks: {
          //           //   on_CalloutComponent: {
          //           //     _id: true,
          //           //     __typename: true,
          //           //     _title: true,
          //           //     body: { json: { content: true } },
          //           //     type: true,
          //           //   },
          //           //   on_TabsComponent: {
          //           //     _id: true,
          //           //     __typename: true,
          //           //     tabs: {
          //           //       items: {
          //           //         _id: true,
          //           //         _title: true,
          //           //         body: { code: true, language: true },
          //           //       },
          //           //     },
          //           //   },
          //           //   on_CardsComponent: {
          //           //     _id: true,
          //           //     __typename: true,
          //           //     cards: {
          //           //       items: {
          //           //         link: true,
          //           //         instance: {
          //           //           _id: true,
          //           //           _title: true,
          //           //           _slug: true,
          //           //           description: { json: { content: true } },
          //           //           color: true,
          //           //           icon: true,
          //           //           href: true,
          //           //         },
          //           //       },
          //           //     },
          //           //   },
          //           //   on_ReferenceComponent: {
          //           //     _id: true,
          //           //     __typename: true,
          //           //     reference: {
          //           //       _id: true,
          //           //       _title: true,
          //           //       description: { json: { content: true } },
          //           //       icon: true,
          //           //       href: true,
          //           //     },
          //           //   },
          //           //   on_CodeBlockComponent: {
          //           //     _id: true,
          //           //     __typename: true,
          //           //     _title: true,
          //           //     icon: true,
          //           //     code: { language: true, code: true },
          //           //   },
          //           // },
          //         },
          //         markdown: true,
          //       },
          //       _sys: {
          //         lastModifiedAt: true,
          //         slugPath: true
          //       },
          //     },
          //     __args: { filter: { slug: { eq: `/${slug?.join('/') ?? ''}` } } },
          //   },
          // },
        },
      ]}
    >
      {async ([{ docs }]) => {
        'use server'

        const article = docs.articles.item
        // const toc = getTableOfContents(article?.body.markdown ?? '')

        return <div>{article?._slugPath}</div>

        return (
          <DocsPage toc={toc} tableOfContent={{ single: false }}>
            <span data-force-root-facet-color={article?.category._slug as T3M4['root']['facets']['color']} />
            <DocsTitle>{article?._title}</DocsTitle>
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
                    return (
                      <Cards key={_id}>
                        {cards.items.map(({ link, instance: { _id, _title, _slug, description, href, icon } }) => (
                          <Card
                            key={_id}
                            title={_title}
                            href={link ? href : undefined}
                            icon={icon ? <span data-facet-color={_slug as T3M4['root']['facets']['color']} className='text-fd-primary' dangerouslySetInnerHTML={{ __html: icon }} /> : undefined}
                          >
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
                      <Tabs items={tabs.items.map((t) => t._title)} persist={persistent}>
                        {tabs.items.map(({ _id, _title, body }) => (
                          <Tab key={_id} value={_title}>
                            <DynamicCodeBlock code={body.code} lang={body.language} />
                          </Tab>
                        ))}
                      </Tabs>
                    )
                  },
                  CodeBlockComponent: async ({ icon, _title, code: { code, language } }) => {
                    const rendered = await highlight(code, {
                      lang: language,
                      components: {
                        pre: CodeBlock.Pre,
                      },
                    })

                    return (
                      <CodeBlock.CodeBlock title={_title} icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg {...props} className='h-4 w-4' /> }} /> : undefined}>
                        {rendered}
                      </CodeBlock.CodeBlock>
                    )
                  },
                }}
                content={article?.body.json.content}
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
