'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAuthRoute = pathname === '/signin' || pathname === '/register' || pathname === '/forgot-password' || pathname?.startsWith('/kyc')

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
