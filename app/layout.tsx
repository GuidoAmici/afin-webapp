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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://afinsrl.com.ar'
  ),
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
