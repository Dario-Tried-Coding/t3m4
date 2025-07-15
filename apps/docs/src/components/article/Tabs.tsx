import { fragmentOn } from 'basehub'
import { Tab, Tabs } from 'fumadocs-ui/components/tabs'

export const TabsFragment = fragmentOn('TabsComponent', { __typename: true, _id: true, tabs: { items: { _slug: true, _title: true, body: true } } })
export type TabsFragment = fragmentOn.infer<typeof TabsFragment>

export const TabsComponent = ({ tabs }: TabsFragment) => (
  <Tabs items={tabs.items.map(({ _title }) => _title)}>
    {tabs.items.map(({ _slug, _title, body }) => (
      <Tab key={_slug} value={_title} title={_title}>
        {body}
      </Tab>
    ))}
  </Tabs>
)
