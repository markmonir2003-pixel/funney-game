import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Play 2 Learn - تعلم أساسيات البرمجة',
  description: 'لعبة تعليمية تفاعلية لطلاب الصف الأول الثانوي لتعلم أساسيات البرمجة. أتقن الخوارزميات والمتغيرات والحلقات والمزيد من خلال التحديات الممتعة.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/Header'
import { Cairo } from 'next/font/google'
import { AccessibilityProvider } from '@/hooks/useAccessibility'

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
        <head />
        <body className="font-arabic antialiased min-h-screen" suppressHydrationWarning>
          <AccessibilityProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <div className="fixed inset-0 bg-background pointer-events-none" />
              <div className="relative z-0 pt-20">
                <Header />
                {children}
              </div>
            </ThemeProvider>
          </AccessibilityProvider>
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </body>
      </html>
    </ClerkProvider>
  )
}
