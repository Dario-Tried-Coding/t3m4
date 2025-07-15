import { fragmentOn } from 'basehub'
import { Cards } from 'fumadocs-ui/components/card'
import { CardComponent, CardFragment } from './Card'
import { cn } from '@/lib/utils'

export const CardsFragment = fragmentOn('CardsComponent', { __typename: true, _id: true, cards: { items: { ...CardFragment, single: true, _id: true } } })
export type CardsFragment = fragmentOn.infer<typeof CardsFragment>

export const CardsComponent = (props: CardsFragment) => {
  const cards = [] as (fragmentOn.infer<typeof CardsFragment>['cards']['items'] | fragmentOn.infer<typeof CardsFragment>['cards']['items'][number])[]
  let buffer = undefined as fragmentOn.infer<typeof CardsFragment>['cards']['items'] | undefined

  const flushBuffer = () => {
    if (buffer) cards.push(buffer)
    buffer = undefined
  }

  props.cards.items.forEach((card) => {
    if (card.single) {
      flushBuffer()
      cards.push(card)
    } else {
      if (buffer) buffer.push(card)
      else buffer = [card]
    }
  })
  flushBuffer()

  return (
    <>
      {cards.map((i, index) => {
        if (Array.isArray(i))
          return (
            <Cards key={index} className={cn(index < cards.length - 1 && 'mb-3')}>
              {i.map(({ url, _id, _title, description, icon }) => (
                <CardComponent key={_id} {...{ _title, description, url, icon }} />
              ))}
            </Cards>
          )

        const { _id, _title, description, icon, url } = i

        return <CardComponent key={_id} className={cn(index < cards.length - 1 && 'mb-3')} {...{ _title, description, url, icon }} />
      })}
    </>
  )
}
