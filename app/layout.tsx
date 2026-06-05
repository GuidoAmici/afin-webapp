import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

// NEXT_PUBLIC_SITE_URL se configura en Vercel por entorno:
//   staging:    https://stg.afinsrl.com.ar
//   production: https://afinsrl.com.ar
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://afinsrl.com.ar')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Afin SRL — Fábrica de tapas y envases plásticos',
    template: '%s — Afin SRL',
  },
  description:
    'Afin SRL fabrica tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Fabricación 100% argentina.',
  openGraph: {
    title: 'Afin SRL — Fábrica de tapas y envases plásticos',
    description:
      'Fabricamos tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Calidad nacional, atención personalizada.',
    siteName: 'Afin SRL',
    locale: 'es_AR',
    type: 'website',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'Afin SRL — Tapas, cierres y envases plásticos',
    }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <Header />
          {children}
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
