import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Alatoul - Transportation, Available All the Time',
  description: 'Innovative ride-hailing and mobility platform offering fast, flexible, and affordable transportation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}

