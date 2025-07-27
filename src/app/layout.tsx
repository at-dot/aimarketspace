import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import Script from 'next/script'

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
        
        {/* Termly Cookie Consent Banner */}
        <Script
          id="termly-consent"
          type="text/javascript"
          src="https://app.termly.io/embed.min.js"
          data-auto-block="on"
          data-website-uuid="3092df03-5021-4723-a18a-b29aabe70c97"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  )
}