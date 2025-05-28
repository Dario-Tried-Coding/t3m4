import { Locale } from "next-intl"

interface Props {
  params: Promise<{ locale: Locale }>
}

export default async function Home({params}:Props) {
  const { locale } = await params

  return <div>page {locale}</div>
}
