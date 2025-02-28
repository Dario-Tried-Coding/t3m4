import { config, fields, collection } from '@keystatic/core'

export const showAdminUI = process.env.NODE_ENV === 'development'

export default config({
  ui: {
    brand: {
      name: 'T3M4',
      mark({ colorScheme }) {
        const path = colorScheme === 'dark' ? '/logo-light.svg' : '/logo-dark.svg'

        return <img src={path} alt="T3M4" width={24} height={24} />
      },
    },
  },
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
})
