import type { Metadata } from 'next'
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google'
import './globals.css'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
})

export const metadata: Metadata = {
  title: 'أثر | تعلم العلوم الإسلامية بطريقة تفاعلية بلمسة عصرية',
  description: 'أثر هو رفيقك التعليمي اليومي لبناء أساس متين من المعرفة الإسلامية من خلال دروس تفاعلية ممتعة وموجزة.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'أثر',
  },
  openGraph: {
    title: 'أثر | تعلم العلوم الإسلامية بطريقة تفاعلية بلمسة عصرية',
    description: 'رفيقك التعليمي اليومي لبناء أساس متين من المعرفة الإسلامية من خلال دروس تفاعلية موجزة.',
    url: 'https://athar-app.vercel.app',
    siteName: 'أثر',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أثر | العلوم الإسلامية التفاعلية',
    description: 'تعلم العلوم الإسلامية بطريقة تفاعلية بلمسة عصرية في ٥ دقائق يومياً.',
  },
}

import { AppShell } from '@/components/AppShell'
import { PwaRegister } from '@/components/PwaRegister'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'أثر',
    'url': 'https://athar-app.vercel.app',
    'description': 'تطبيق ويب تقدمي لتعلم العلوم الإسلامية بطريقة تفاعلية مبسطة في ٥ دقائق يومياً.',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'All',
  }

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexSansArabic.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AppShell>
          {children}
        </AppShell>
        <PwaRegister />
      </body>
    </html>
  )
}
