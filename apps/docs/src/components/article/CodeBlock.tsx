import { highlightCode } from '@/helpers/basehub/article'
import { fragmentOn } from 'basehub'
import { Icon } from 'basehub/react-icon'
import { CodeBlock, CodeBlockProps } from 'fumadocs-ui/components/codeblock'

export const CodeBlockFragment = fragmentOn('CodeBlockComponent', { _id: true, fileLocation: true, icon: true, code: { code: true, language: true } })
export type CodeBlockFragment = fragmentOn.infer<typeof CodeBlockFragment>

type Props = Omit<CodeBlockProps, 'children'> & Partial<Omit<CodeBlockFragment, 'code'>> & Pick<CodeBlockFragment, 'code'>
export const CodeBlockComponent = async ({ fileLocation, code: { code, language }, icon }: Props) => {
  const rendered = await highlightCode(code, language)
  return (
    <CodeBlock icon={icon ? <Icon content={icon} components={{ svg: (props) => <svg className='h-3.5 w-3.5' {...props} /> }} /> : undefined} title={fileLocation ?? undefined}>
      {rendered}
    </CodeBlock>
  )
}
