'use client'

import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { ScrollArea, ScrollBar } from '../ui/ScrollArea'
import { config, schema, T3M4, useT3M4 } from '@/lib/T3M4'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'

export function ThemeCustomizer({ className, ...props }: ComponentProps<'div'>) {
  const { state, updateState } = useT3M4('demo')

  return (
    <div className={cn('flex w-full items-center gap-2', className)} {...props}>
      {/* wide displays */}
      <ScrollArea className='hidden lg:flex'>
        {schema.demo.facets.color.map((color) => (
          <Button
            key={color}
            variant='link'
            size='sm'
            data-active={color === state.computed?.facets.color}
            onClick={() => updateState({ facets: { color } })}
            className='text-muted-foreground hover:text-primary data-[active=true]:text-primary mr-4 cursor-pointer text-base capitalize transition-colors hover:no-underline'
          >
            {color}
          </Button>
        ))}
        <ScrollBar orientation='horizontal' className='invisible' />
      </ScrollArea>

      {/* narrow displays */}
      <div className='flex items-center gap-2 lg:hidden'>
        <Label htmlFor='theme-selector' className='sr-only'>
          Theme
        </Label>
        <Select value={state.computed?.facets.color ?? config.demo.facets.color.default} onValueChange={(color: T3M4<'demo'>['facets']['color']) => updateState({ facets: { color } })}>
          <SelectTrigger id='theme-selector' size='sm' className='capitalize shadow-none *:data-[slot=select-value]:w-12'>
            <span className='font-medium'>Theme:</span>
            <SelectValue placeholder='Select a theme' />
          </SelectTrigger>
          <SelectContent align='end'>
            <SelectGroup>
              {schema.demo.facets.color.map((color) => (
                <SelectItem key={color} value={color} className='capitalize data-[state=checked]:opacity-50'>
                  {color}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
