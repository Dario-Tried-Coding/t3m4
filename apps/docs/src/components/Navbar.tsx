import { FC } from 'react'
import { Icons } from './Icons'
import { Link } from '@/lib/next-intl/navigation'

export const Navbar: FC = () => {
  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 w-full border-b border-dashed backdrop-blur'>
      <div className='container flex h-14 items-center border-x border-dashed'>
        <div className='hidden md:flex'>
          <Link href='/' className='flex items-center gap-4'>
            <Icons.logo className='h-6 w-6' />
            <span className='hidden font-bold lg:inline-block'>T3M4</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
