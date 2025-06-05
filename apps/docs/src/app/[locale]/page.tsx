import { Moment } from "@/components/Moment"
import { Locale } from "next-intl"

interface Props {
  params: Promise<{ locale: Locale }>
}

export default async function Home({params}:Props) {
  const { locale } = await params

  return <div className="">page {locale}
    <Moment />
  </div>
}
