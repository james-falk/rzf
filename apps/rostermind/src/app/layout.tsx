import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'RosterMind AI — Neural Fantasy Intelligence',
  description: 'Your AI-powered fantasy football assistant. Roster grades, waiver targets, trade advice, and weekly lineup decisions — powered by real-time NFL data.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'RosterMind AI',
    description: 'Neural-powered fantasy football intelligence. Analyze your roster instantly.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className="dark">
        <body className="min-h-screen antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
