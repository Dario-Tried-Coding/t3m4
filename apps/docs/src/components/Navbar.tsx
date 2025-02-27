import Link from 'next/link'
import { FC } from 'react'
import { Icons } from './Icons'

export const Navbar: FC = () => {
  return <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 w-full border-b border-dashed backdrop-blur'>
    <div className="container border-x border-dashed h-14 flex items-center">
      <div className='hidden md:flex'>
        <Link href='/'>
          <Icons.logo className='h-4' />
        </Link>
      </div>
    </div>
  </header>
}
