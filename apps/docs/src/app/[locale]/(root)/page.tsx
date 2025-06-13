import { Demo } from '@/components/demo'
import { Header } from '@/components/Header'
import { PageNav } from '@/components/PageNav'
import { buttonVariants } from '@/components/ui/Button'
import { Link } from '@/lib/next-intl/navigation'
import { Pump } from 'basehub/react-pump'
import { Locale } from 'next-intl'
import { draftMode } from 'next/headers'
import { basehub } from '../../../../.basehub'

interface Props {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params

  const {
    site: {
      pages: {
        items: [
          {
            metadataOverrides: { title },
          },
        ],
      },
    },
  } = await basehub().query({
    site: {
      pages: {
        __args: {
          variants: {
            languages: locale,
          },
        },
        items: {
          metadataOverrides: {
            title: true,
          },
        },
      },
    },
  })

  return {
    title,
  }
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  return (
    <Pump
      queries={[
        {
          site: {
            pages: {
              __args: {
                variants: {
                  languages: locale,
                },
                filter: {
                  pathname: {
                    eq: '/',
                  },
                },
              },
              items: {
                sections: {
                  __args: {
                    variants: {
                      languages: locale,
                    },
                  },
                  _id: true,
                  _title: true,
                  heading: true,
                  description: true,
                  actions: {
                    _id: true,
                    blank: true,
                    href: true,
                    label: true,
                    variants: {
                      size: true,
                      variant: true,
                    },
                  },
                },
              },
            },
          },
        },
      ]}
      draft={(await draftMode()).isEnabled}
    >
      {async ([
        {
          site: {
            pages: {
              items: [{ sections }],
            },
          },
        },
      ]) => {
        'use server'

        return (
          <div className='flex flex-col'>
            {sections?.map((s) => {
              if (s._title === 'Header')
                return (
                  <Header key={s._id}>
                    <Header.Heading>{s?.heading}</Header.Heading>
                    <Header.Description>{s?.description}</Header.Description>
                    <Header.Actions>
                      {s?.actions?.map(({ _id, href, blank, label, variants: { size, variant } }) => (
                        <Link key={_id} href={href} target={blank ? '_blank' : '_self'} className={buttonVariants({ size, variant })}>
                          {label}
                        </Link>
                      ))}
                    </Header.Actions>
                  </Header>
                )

              return null
            })}

            {/* <PageNav>
              <Demo.ThemeCustomizer />
            </PageNav>
            <div className='container-wrapper section-soft flex flex-1 flex-col pb-6'>
              <div className='theme-container container flex flex-1 flex-col'>
                <Demo.Cards />
              </div>
            </div> */}
          </div>
        )
      }}
    </Pump>
  )
}
