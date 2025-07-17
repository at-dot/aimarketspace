import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'AIMarketSpace',
  description: 'Where AI Solutions Meet Business Needs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}