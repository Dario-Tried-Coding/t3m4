import { ArticleFragmentRecursive, ArticleSlugFragmentRecursive } from '@/helpers/basehub/fragments'
import { flattenArticlesPaths, getArticleBySlug } from '@/helpers/basehub/page'
import { basehub } from 'basehub'
import { Pump } from 'basehub/react-pump'
import { Locale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

export const generateStaticParams = async () => {
  const { docs } = await basehub().query({
    docs: {
      _dashboardUrl: true,
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
  console.log({ slugs, locale })

  setRequestLocale(locale)

  if (!slugs || slugs.length === 0) return redirect('/docs/introduction')

  return (
    <Pump
      queries={[
        {
          docs: {
            item: ArticleFragmentRecursive,
            __args: {
              filter: {
                _sys_slug: {
                  eq: slugs[0],
                },
              },
            },
          },
        },
      ]}
      bind={{ slugs }}
    >
      {async (
        { slugs },
        [
          {
            docs: { item: article },
          },
        ]
      ) => {
        'use server'

        if (!article) return

        const slug = '/' + slugs.join('/')
        const currArticle = getArticleBySlug(article, slug)

        return <pre>{JSON.stringify(currArticle, null, 2)}</pre>

        // return (
        //   <DocsPage toc={toc} tableOfContent={{ single: false }}>
        //     <DocsTitle>{article?._title}</DocsTitle>
        //     <DocsDescription className='mb-0'>{article?.excerpt}</DocsDescription>
        //     <div className='flex gap-2'>
        //       <CopyMarkdown />
        //       <OpenInBtn />
        //     </div>
        //     <hr />
        //     <DocsBody>
        //       <RichText
        //         blocks={article?.body?.json.blocks}
        //         components={{
        //           pre: ({ code, language }) => <DynamicCodeBlock code={code} lang={language} />,
        //           li: ({ children, ...props }) => (
        //             <li {...props} className='[&_p]:my-0'>
        //               {children}
        //             </li>
        //           ),
        //           CardsComponent: ({ _id, cards }) => {
        //             return (
        //               <Cards key={_id}>
        //                 {cards.items.map(({ link, instance: { _id, _title, _slug, description, href, icon } }) => (
        //                   <Card
        //                     key={_id}
        //                     title={_title}
        //                     href={link ? href : undefined}
        //                     icon={icon ? <span data-facet-color={_slug as T3M4['root']['facets']['color']} className='text-fd-primary' dangerouslySetInnerHTML={{ __html: icon }} /> : undefined}
        //                   >
        //                     <RichText>{description?.json.content}</RichText>
        //                   </Card>
        //                 ))}
        //               </Cards>
        //             )
        //           },
        //           CalloutComponent: ({ _title, body, type }) => {
        //             return (
        //               <Callout type={type ?? undefined} title={_title}>
        //                 <RichText components={customComponents}>{body?.json.content}</RichText>
        //               </Callout>
        //             )
        //           },
        //           TabsComponent: ({ tabs, persistent }) => {
        //             return (
        //               <Tabs items={tabs.items.map((t) => t._title)} persist={persistent}>
        //                 {tabs.items.map(({ _id, _title, body }) => (
        //                   <Tab key={_id} value={_title}>
        //                     <DynamicCodeBlock code={body.code} lang={body.language} />
        //                   </Tab>
        //                 ))}
        //               </Tabs>
        //             )
        //           },
        //           CodeBlockComponent: async ({ icon, _title, code: { code, language } }) => {
        //             const rendered = await highlight(code, {
        //               lang: language,
        //               components: {
        //                 pre: CodeBlock.Pre,
        //               },
        //             })

        //             return (
        //               <CodeBlock.CodeBlock title={_title} icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg {...props} className='h-4 w-4' /> }} /> : undefined}>
        //                 {rendered}
        //               </CodeBlock.CodeBlock>
        //             )
        //           },
        //         }}
        //         content={article?.body?.json.content}
        //       />
        //       <Rate />
        //       {article?._sys.lastModifiedAt && <LastUpdated date={article._sys.lastModifiedAt} />}
        //     </DocsBody>
        //   </DocsPage>
        // )
      }}
    </Pump>
  )
}
