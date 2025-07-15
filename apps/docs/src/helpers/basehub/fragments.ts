import { AccordionsFragment } from '@/components/article/Accordions'
import { CalloutFragment } from '@/components/article/Callout'
import { CardFragment } from '@/components/article/Card'
import { CardsFragment } from '@/components/article/Cards'
import { CodeBlockFragment } from '@/components/article/CodeBlock'
import { CodeBlockTabsFragment } from '@/components/article/CodeBlockTabs'
import { TabsFragment } from '@/components/article/Tabs'
import { fragmentOn, fragmentOnRecursiveCollection } from 'basehub'

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
        __typename: true,
        on_CardComponent: CardFragment,
        on_CardsComponent: CardsFragment,
        on_AccordionsComponent: AccordionsFragment,
        on_CalloutComponent: CalloutFragment,
        on_TabsComponent: TabsFragment,
        on_CodeBlockTabsComponent: CodeBlockTabsFragment,
        on_CodeBlockComponent: CodeBlockFragment
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
