import { cn } from "@/lib/utils";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Copy } from "fumadocs-ui/internal/icons";

export function CopyMarkdown() {
  return (
    <button
      disabled
      className={cn(
        buttonVariants({
          color: 'secondary',
          size: 'sm',
          className: '[&_svg]:text-fd-muted-foreground gap-2 [&_svg]:size-3.5',
        })
      )}
    >
      <Copy />
      Copy Markdown
    </button>
  )
}