import { fragmentOn, fragmentOnRecursiveCollection } from 'basehub'

export const CardFragment = fragmentOn('CardComponent', {
  _id: true,
  __typename: true,
  _title: true,
  _slug: true,
  description: { plainText: true },
  icon: true,
  url: true,
  single: true,
})

export const CardsFragment = fragmentOn('CardsComponent', { __typename: true, _id: true, cards: { items: CardFragment } })

export const ArticleFragment = fragmentOn('ArticleComponent', {
  _id: true,
  _title: true,
  _slug: true,
  excerpt: true,
  icon: true,
  root: true,
  _sys: { lastModifiedAt: true },
  body: {
    readingTime: true,
    json: {
      content: true,
      blocks: {
        on_CardComponent: CardFragment,
        on_CardsComponent: CardsFragment,
        on_AccordionsComponent: { __typename: true, _id: true, type: true, accordions: { items: { _id: true, _slug: true, _title: true, body: true } } },
        on_CalloutComponent: { __typename: true, _id: true, type: true, body: { json: { content: true } }, title: true },
        on_TabsComponent: { __typename: true, _id: true, tabs: { items: { _slug: true, _title: true, body: true } } },
        on_CodeBlockComponent: { __typename: true, _id: true, _title: true, tabs: { items: { _slug: true, _title: true, icon: true, fileName: true, code: { language: true, code: true } } } },
      },
    },
    markdown: true,
  },
  ogImage: { url: true, width: true, height: true },
})
export type ArticleFragment = fragmentOn.infer<typeof ArticleFragment>

export const ArticleFragmentRecursive = fragmentOnRecursiveCollection('ArticleComponent', ArticleFragment, { recursiveKey: 'children', levels: 10 })
export type ArticleFragmentRecursive = fragmentOn.infer<typeof ArticleFragmentRecursive>

export const ArticleSlugFragment = fragmentOn('ArticleComponent', { _id: true, _slug: true, icon: true, _title: true, root: true })
export type ArticleSlugFragment = fragmentOn.infer<typeof ArticleSlugFragment>

export const ArticleSlugFragmentRecursive = fragmentOnRecursiveCollection('ArticleComponent', ArticleSlugFragment, { recursiveKey: 'children', levels: 10 })
export type ArticleSlugFragmentRecursive = fragmentOn.infer<typeof ArticleSlugFragmentRecursive>
