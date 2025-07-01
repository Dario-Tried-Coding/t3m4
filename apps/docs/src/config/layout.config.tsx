import { basehub } from 'basehub'
import { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

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
          <span dangerouslySetInnerHTML={{ __html: settings.logo }} className='h-5 w-5' />
          <span className='text-sm tracking-wide'>T3M4</span>
        </>
      ),
      transparentMode: 'top',
    },
  }
}
