import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RZF Command Center',
  description: 'Red Zone Fantasy command center',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
