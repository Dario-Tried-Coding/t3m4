import { basehub } from 'basehub'
import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { Icon } from 'basehub/react-svg'
import { PropsWithChildren } from 'react'
import { RootProvider } from 'fumadocs-ui/provider'
import { Locale } from 'next-intl'

export const baseOptions = async (): Promise<BaseLayoutProps> => {
  const { settings } = await basehub().query({ settings: { logo: true } })

  return {
    themeSwitch: {
      enabled: false,
    },
    nav: {
      url: '/',
      title: (
        <>
          <Icon content={settings.logo} components={{ svg: (props) => <svg {...props} className='h-5 w-5' /> }} />
          <span className='text-sm tracking-wide'>T3M4</span>
        </>
      ),
      transparentMode: 'top',
    },
  }
}

export const FumadocsProvider = ({ children, locale }: PropsWithChildren<{ locale: Locale }>) => {
  return (
    <RootProvider
      i18n={{
        locale,
        locales: [{ locale: 'en', name: 'English' }],
      }}
      theme={{ enabled: false }}
    >
      {children}
    </RootProvider>
  )
}
