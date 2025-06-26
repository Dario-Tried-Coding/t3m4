import { CopyMarkdown } from '@/components/CopyMarkdown'
import { OpenInBtn } from '@/components/OpenInBtn'
import { buildToc } from '@/helpers/toc'
import { customComponents } from '@/lib/basehub'
import { Link } from '@/lib/next-intl/navigation'
import { Pump } from 'basehub/react-pump'
import { RichText } from 'basehub/react-rich-text'
import { Callout } from 'fumadocs-ui/components/callout'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'
import { draftMode } from 'next/headers'

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
            item: {
              _title: true,
              excerpt: true,
              body: {
                json: {
                  content: true,
                  toc: true,
                  blocks: {
                    on_CardsLayoutComponent: {
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
                  CardsLayoutComponent: ({ _id, cards }) => {
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
                  }
                }}
              >
                {docs.item?.body.json.content}
              </RichText>
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
