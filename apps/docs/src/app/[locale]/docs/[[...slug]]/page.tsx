import { Pump } from 'basehub/react-pump'
import { draftMode } from 'next/headers'
import { RichText } from 'basehub/react-rich-text'
import { DocsBody, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { Locale } from 'next-intl'

interface Props {
  params: Promise<{ slug?: string[]; locale: Locale }>
}

export default async function Page(props: Props) {
  const { slug, locale } = await props.params

  return (
    <Pump
      draft={(await draftMode()).isEnabled}
      queries={[{ docs: { item: { _title: true, excerpt: true, body: { json: { content: true, toc: true } } }, __args: { variants: { languages: locale }, filter: { slug: { eq: (slug as unknown as string) ?? '/' } } } } }]}
    >
      {async ([{ docs }]) => {
        'use server'

        // return <pre>{JSON.stringify(docs.item?.body.json.toc, null, 2)}</pre>

        return (
          <DocsPage
            toc={[
              { title: 'Title 1', url: '/docs#title-1', depth: 1 },
              { title: 'Title 1.4', url: '/docs#title-1.4', depth: 3 },
            ]}
            tableOfContent={{ footer: <div>ciaoooooo</div> }}
            footer={{ enabled: true, items: { next: {name: 'next', url: '/docs/next'} } }}
          >
            <DocsTitle>{docs.item?._title}</DocsTitle>
            <DocsBody>
              <RichText>{docs.item?.body.json}</RichText>
            </DocsBody>
          </DocsPage>
        )
      }}
    </Pump>
  )
}
