import { RichTextTocNode } from "basehub"

interface TocEntry {
  title: string
  url: string
  depth: number
}

export function buildToc(nodes: RichTextTocNode[], depth: number = 1): TocEntry[] {
  const out: TocEntry[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'orderedList':
        // quando entriamo in una lista annidata, aumentiamo la profondità
        if (node.content) {
          const nextDepth = Math.min(depth + 1, 6)
          out.push(...buildToc(node.content, nextDepth))
        }
        break

      case 'listItem':
        if (node.content) {
          // listItem di per sé NON cambia la profondità
          out.push(...buildToc(node.content, depth))
        }
        break

      case 'paragraph':
        if (node.content) {
          // cerchiamo testo con mark di tipo link
          let url: string | undefined
          const titleParts: string[] = []

          for (const c of node.content) {
            if (c.type === 'text') {
              titleParts.push(c.text)
              if (!url && c.marks) {
                const link = c.marks.find((m) => m.type === 'link')
                if (link) url = link.attrs.href
              }
            }
          }

          if (url) {
            out.push({
              title: titleParts.join(''),
              url,
              depth,
            })
          }
        }
        break
    }
  }

  return out
}
