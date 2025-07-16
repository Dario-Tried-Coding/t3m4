import { fragmentOn } from 'basehub'
import { Icon } from 'basehub/react-icon'
import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from 'fumadocs-ui/components/codeblock'
import { CodeBlockComponent, CodeBlockFragment } from './CodeBlock'
import { Suspense } from 'react'

const CodeBlockTabFragment = fragmentOn('CodeBlockTabComponent', { _title: true, _slug: true, icon: true, codeBlock: CodeBlockFragment })

export const CodeBlockTabsFragment = fragmentOn('CodeBlockTabsComponent', { __typename: true, _id: true, _title: true, tabs: { items: CodeBlockTabFragment } })
export type CodeBlockTabsFragment = fragmentOn.infer<typeof CodeBlockTabsFragment>

export const CodeBlockTabsComponent = ({ tabs }: CodeBlockTabsFragment) => {
  return (
    <CodeBlockTabs defaultValue={tabs.items.at(0)?._slug} persist>
      <CodeBlockTabsList>
        {tabs.items.map(({ _slug, _title, icon }) => (
          <CodeBlockTabsTrigger key={_slug} value={_slug}>
            {icon && <Icon content={icon} components={{ svg: (props) => <svg className='h-5 w-5' {...props} /> }} />} {_title}
          </CodeBlockTabsTrigger>
        ))}
      </CodeBlockTabsList>
      {tabs.items.map(({ _slug, codeBlock }) => {
        return (
          <CodeBlockTab key={_slug} value={_slug}>
            <Suspense>
              <CodeBlockComponent {...codeBlock} />
            </Suspense>
          </CodeBlockTab>
        )
      })}
    </CodeBlockTabs>
  )
}
