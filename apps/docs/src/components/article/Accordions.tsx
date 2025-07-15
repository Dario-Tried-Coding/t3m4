import { fragmentOn } from 'basehub'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'

export const AccordionsFragment = fragmentOn('AccordionsComponent', { __typename: true, _id: true, type: true, accordions: { items: { _id: true, _slug: true, _title: true, body: true } } })
export type AccordionsFragment = fragmentOn.infer<typeof AccordionsFragment>

export const AccordionsComponent = ({ type, accordions }: AccordionsFragment) => (
  <Accordions type={type}>
    {accordions.items.map(({ _slug, _title, body }) => (
      <Accordion key={_slug} title={_title}>
        {body}
      </Accordion>
    ))}
  </Accordions>
)
