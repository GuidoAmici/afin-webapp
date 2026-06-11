import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/lib/cart'
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
    default: 'AFIN srl — Fábrica de tapas y envases plásticos',
    template: '%s — AFIN srl',
  },
  description:
    'AFIN srl fabrica tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Fabricación 100% argentina.',
  openGraph: {
    title: 'AFIN srl — Fábrica de tapas y envases plásticos',
    description:
      'Fabricamos tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Calidad nacional, atención personalizada.',
    siteName: 'AFIN srl',
    locale: 'es_AR',
    type: 'website',
    images: [{
      url: '/images/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'AFIN srl — Tapas, cierres y envases plásticos',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AFIN srl — Fábrica de tapas y envases plásticos',
    description:
      'Fabricamos tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería. Calidad nacional, atención personalizada.',
    images: ['/images/og-image.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
