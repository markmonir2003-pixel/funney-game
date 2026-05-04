import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL("https://play2learn.com"),
  title: "Play 2 Learn | عالم البرمجة للأبطال",
  description: "منصة تعليمية تفاعلية لتعليم الأطفال والشباب أساسيات البرمجة من خلال الألعاب والتحديات الممتعة.",
  keywords: ["تعليم البرمجة", "ألعاب تعليمية", "أكواد", "برمجة للأطفال", "تعلم البرمجة بالعربي"],
  authors: [{ name: "Play 2 Learn Team" }],
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: "https://play2learn.com",
    title: "Play 2 Learn | العب وتعلم البرمجة",
    description: "انضم لأبطال البرمجة اليوم وابدأ رحلتك في تعلم الخوارزميات والأكواد بطريقة ممتعة!",
    siteName: "Play 2 Learn",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Play 2 Learn Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play 2 Learn | العب وتعلم البرمجة",
    description: "أفضل منصة لتعلم البرمجة من خلال الألعاب التفاعلية.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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

export const viewport = {
  themeColor: '#06b6d4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/Header'
import { Cairo } from 'next/font/google'
import { AccessibilityProvider } from '@/hooks/useAccessibility'
import { Toaster } from '@/components/ui/sonner'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  // Only load the weights we actually use — saves ~100 KB on first load
  weight: ['400', '600', '700', '900'],
  display: 'swap',
  variable: '--font-cairo',
  preload: true,
})

import { Providers } from '@/components/Providers'
import { SyncWrapper } from '@/components/SyncWrapper'
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://clerk.play2learn.com" />
          <link rel="preconnect" href="https://va.vercel-scripts.com" />
          <link rel="dns-prefetch" href="https://clerk.play2learn.com" />
          <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
          <link rel="dns-prefetch" href="https://supabase.co" />
          <link rel="dns-prefetch" href="https://img.clerk.com" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          {/* Mobile Speed Optimization: Preload the main font */}
          <link rel="preload" href="/fonts/LutfeyArabicDEMO.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <style dangerouslySetInnerHTML={{ __html: `
            * { touch-action: manipulation; }
            body { -webkit-tap-highlight-color: transparent; }
          `}} />
          <script dangerouslySetInnerHTML={{ __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}} />
        </head>
        <body className="font-arabic antialiased min-h-screen" suppressHydrationWarning>
          <Providers>
            <AccessibilityProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <div className="fixed inset-0 bg-background pointer-events-none" />
                <div className="relative z-0 pt-20">
                  <SyncWrapper />
                  <Header />
                  {children}
                </div>
                <Toaster position="top-center" expand={true} richColors />
              </ThemeProvider>
            </AccessibilityProvider>
          </Providers>
          {process.env.NODE_ENV === 'production' && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </body>
      </html>
    </ClerkProvider>
  )
}
