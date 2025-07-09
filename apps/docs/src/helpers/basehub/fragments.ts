import { fragmentOn, fragmentOnRecursiveCollection } from 'basehub'

export const ArticleBodyFragment = fragmentOn('BodyRichText', {
  content: true,
  toc: true,
  // blocks: {
  //   on_CalloutComponent: {
  //     _id: true,
  //     __typename: true,
  //     _title: true,
  //     body: { json: { content: true } },
  //     type: true,
  //   },
  //   on_TabsComponent: {
  //     _id: true,
  //     __typename: true,
  //     tabs: {
  //       items: {
  //         _id: true,
  //         _title: true,
  //         body: { code: true, language: true },
  //       },
  //     },
  //   },
  //   on_CardsComponent: {
  //     _id: true,
  //     __typename: true,
  //     cards: {
  //       items: {
  //         link: true,
  //         instance: {
  //           _id: true,
  //           _title: true,
  //           _slug: true,
  //           description: { json: { content: true } },
  //           color: true,
  //           icon: true,
  //           href: true,
  //         },
  //       },
  //     },
  //   },
  //   on_CodeBlockComponent: {
  //     _id: true,
  //     __typename: true,
  //     _title: true,
  //     icon: true,
  //     code: { language: true, code: true },
  //   },
  // },
})
export type ArticleBodyFragment = fragmentOn.infer<typeof ArticleBodyFragment>

export const ArticleFragment = fragmentOn('ArticleComponent', {
  _id: true,
  _title: true,
  _slug: true,
  excerpt: true,
  icon: true,
  root: true,
  _sys: { lastModifiedAt: true },
  body: { readingTime: true, json: { content: true }, markdown: true },
})
export type ArticleFragment = fragmentOn.infer<typeof ArticleFragment>

export const ArticleFragmentRecursive = fragmentOnRecursiveCollection('ArticleComponent', ArticleFragment, { recursiveKey: 'children', levels: 3 })
export type ArticleFragmentRecursive = fragmentOn.infer<typeof ArticleFragmentRecursive>

export const ArticleSlugFragment = fragmentOn('ArticleComponent', { _id: true, _slug: true, icon: true, _title: true, root: true })
export type ArticleSlugFragment = fragmentOn.infer<typeof ArticleSlugFragment>

export const ArticleSlugFragmentRecursive = fragmentOnRecursiveCollection('ArticleComponent', ArticleSlugFragment, { recursiveKey: 'children', levels: 3 })
export type ArticleSlugFragmentRecursive = fragmentOn.infer<typeof ArticleSlugFragmentRecursive>
