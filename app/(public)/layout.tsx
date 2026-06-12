import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  )
}
