import { CopyMarkdown } from '@/components/CopyMarkdown'
import { OpenInBtn } from '@/components/OpenInBtn'
import { buildToc } from '@/helpers/toc'
import { customComponents } from '@/lib/basehub'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'
import { ChevronDown } from 'fumadocs-ui/internal/icons'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { draftMode } from 'next/headers'
import { CodeBlock as BH_CodeBlock, createCssVariablesTheme } from 'basehub/react-code-block'

interface Props {
  params: Promise<{ slug?: string[]; locale: Locale }>
}

const theme = createCssVariablesTheme({
  name: 'css-variables',
  variablePrefix: '--shiki-',
  variableDefaults: {
    'token-constant': '#d73a49',
  },
  fontStyle: true,
})

export default async function Page(props: Props) {
  const { slug, locale } = await props.params

  return (
    <Pump
      draft={(await draftMode()).isEnabled}
      queries={[
        {
          docs: {
            item: {
              _title: true,
              excerpt: true,
              body: {
                json: {
                  content: true,
                  toc: true,
                  blocks: {
                    on_CardsComponent: {
                      _id: true,
                      __typename: true,
                      cards: {
                        items: {
                          _id: true,
                          _title: true,
                          primaryColor: true,
                          description: { json: { content: true } },
                          href: true,
                          icon: true,
                        },
                      },
                    },
                    on_CalloutComponent: {
                      _id: true,
                      __typename: true,
                      _title: true,
                      body: { json: { content: true } },
                      type: true,
                    },
                    on_TabsComponent: {
                      _id: true,
                      __typename: true,
                      label: true,
                      tabs: {
                        items: {
                          _id: true,
                          _title: true,
                          body: { code: true, language: true },
                        },
                      },
                    },
                  },
                },
              },
            },
            __args: { variants: { languages: locale }, filter: { slug: { eq: (slug as unknown as string) ?? '/' } } },
          },
        },
      ]}
    >
      {async ([{ docs }]) => {
        'use server'

        const toc = buildToc(docs.item?.body.json.toc ?? [])

        return (
          <DocsPage toc={toc}>
            <DocsTitle>{docs.item?._title}</DocsTitle>
            <DocsDescription className='mb-0'>{docs.item?.excerpt}</DocsDescription>
            <div className='flex gap-2'>
              <CopyMarkdown />
              <OpenInBtn />
            </div>
            <hr />
            <DocsBody>
              <RichText
                blocks={docs.item!.body.json.blocks}
                components={{
                  pre: ({ language, code }) => <DynamicCodeBlock lang={language} code={code} />,
                  li: ({ children, ...props }) => (
                    <li {...props} className='[&_p]:my-0'>
                      {children}
                    </li>
                  ),
                  CardsComponent: ({ _id, cards }) => {
                    const colors = {
                      blue: 'text-blue-300',
                      green: 'text-green-300',
                      purple: 'text-purple-300',
                    }

                    return (
                      <Cards key={_id}>
                        {cards.items.map(({ _id, _title, description, primaryColor, href, icon }) => (
                          <Card key={_id} title={_title} href={href ?? undefined} icon={icon ? <span className={primaryColor ? colors[primaryColor] : undefined} dangerouslySetInnerHTML={{ __html: icon }} /> : undefined}>
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
                  TabsComponent: ({ label, tabs }) => {
                    return (
                      <Tabs items={tabs.items.map((t) => t._title)} label={label} persist>
                        {tabs.items.map((tab) => (
                          <Tab key={tab._id} value={tab._title}>
                            <DynamicCodeBlock lang={tab.body.language} code={tab.body.code} />
                          </Tab>
                        ))}
                      </Tabs>
                    )
                  },
                }}
              >
                {docs.item?.body.json.content}
              </RichText>
              <CodeBlock icon={<ChevronDown />} title='Example'>
                <BH_CodeBlock snippets={[{ code: 'console.log("hi")', language: 'ts' }]} theme={theme} />
              </CodeBlock>
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
