import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Red Zone Fantasy — NFL Data Hub',
  description:
    'The premier NFL fantasy football data directory. Rankings, projections, injury reports, and expert analysis — all in one place.',
  openGraph: {
    title: 'Red Zone Fantasy',
    description: 'NFL Data Hub — Rankings, projections, news, and more.',
    siteName: 'Red Zone Fantasy',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
