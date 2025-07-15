import { highlightCode } from '@/helpers/basehub/article'
import { Link } from '@/lib/next-intl/navigation'
import { fragmentOn } from 'basehub'
import { RichText } from 'basehub/react-rich-text'
import { Callout } from 'fumadocs-ui/components/callout'
import { CodeBlock } from 'fumadocs-ui/components/codeblock'

export const CalloutFragment = fragmentOn('CalloutComponent', { __typename: true, _id: true, type: true, body: { json: { content: true } }, title: true })
export type CalloutFragment = fragmentOn.infer<typeof CalloutFragment>

export const CalloutComponent = ({ type, title, body }: CalloutFragment) => (
  <Callout title={title} type={type}>
    <RichText
      content={body.json.content}
      components={{
        a: (props) => <Link {...props} />,
        pre: async ({ code, language, ...props }) => {
          const rendered = await highlightCode(code, language)
          return <CodeBlock {...props}>{rendered}</CodeBlock>
        },
      }}
    />
  </Callout>
)
