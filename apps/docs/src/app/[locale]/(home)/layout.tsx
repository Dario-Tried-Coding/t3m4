import { PropsWithChildren } from 'react'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/config/layout.config'

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <HomeLayout {...await baseOptions()} links={[{ type: 'main', text: 'Docs', url: '/docs' }]}>
      {children}
    </HomeLayout>
  )
}
