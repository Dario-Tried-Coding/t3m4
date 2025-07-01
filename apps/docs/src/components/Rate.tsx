'use client'

import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Collapsible } from "fumadocs-ui/components/ui/collapsible";
import { useTranslations } from "next-intl";
import { ThumbsDown, ThumbsUp } from 'lucide-react'

const rateButtonVariants = cva('inline-flex items-center gap-2 px-3 py-2 rounded-full font-medium border text-sm [&_svg]:size-4 disabled:cursor-not-allowed', {
  variants: {
    active: {
      true: 'bg-fd-accent text-fd-accent-foreground [&_svg]:fill-current',
      false: 'text-fd-muted-foreground',
    },
  },
})

export function Rate() {
  const t = useTranslations("docs.Rate");

  return (
    <Collapsible open={false} onOpenChange={() => {}} className="border-y py-3">
      <div className="flex flex-row items-center gap-2">
        <p className="text-sm font-medium pe-2">{t('question')}</p>
        <button disabled className={cn(rateButtonVariants({ active: false }))}>
          <ThumbsUp /> {t('good')}
        </button>
        <button disabled className={cn(rateButtonVariants({ active: false }))}>
          <ThumbsDown /> {t('bad')}
        </button>
      </div>
    </Collapsible>
  )
}