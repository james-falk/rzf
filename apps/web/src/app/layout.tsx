import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Red Zone Fantasy',
  description: 'NFL RedZone for fantasy — AI-powered team analysis and insights',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
