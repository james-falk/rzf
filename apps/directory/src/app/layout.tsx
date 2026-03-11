import type { Metadata } from 'next'
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
