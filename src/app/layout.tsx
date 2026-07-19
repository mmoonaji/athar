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
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'أثر',
    'url': 'https://athar-app.vercel.app',
    'description': 'تطبيق ويب تقدمي لتعلم العلوم الإسلامية بطريقة تفاعلية مبسطة في ٥ دقائق يومياً.',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'All',
    'inLanguage': 'ar',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'ما هو تطبيق أثر؟',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'أثر هو منصة تعليمية إسلامية تفاعلية تُمكّنك من تعلم العلوم الشرعية الأصيلة في ٥ دقائق يومياً من خلال دروس منظمة ومصادر موثوقة.',
        },
      },
      {
        '@type': 'Question',
        'name': 'هل التطبيق مجاني؟',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'نعم، تطبيق أثر مجاني بالكامل. يمكنك إنشاء حساب والبدء في التعلم فوراً دون أي تكلفة.',
        },
      },
      {
        '@type': 'Question',
        'name': 'من أي مصادر يستمد أثر محتواه؟',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'يستند أثر إلى القرآن الكريم والسنة النبوية الصحيحة وفهم السلف الصالح وإجماع العلماء المعتبرين.',
        },
      },
      {
        '@type': 'Question',
        'name': 'كيف أتابع تقدمي في التعلم؟',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'يتتبع أثر تلقائياً جميع الدروس التي أتممتها ويعرض لك تقدمك اليومي وسلسلة أيام التعلم المتواصلة في لوحة رحلتك التعليمية.',
        },
      },
    ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ErrorBoundary>
          <AppShell>
            {children}
          </AppShell>
        </ErrorBoundary>
        <PwaRegister />
      </body>
    </html>
  )
}
