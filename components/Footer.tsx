import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <Image src="/images/logo.png" alt="AFIN srl" className="footer-logo" width={120} height={44} />
            <p className="footer-tagline">
              Fábrica argentina de tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería.
            </p>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                +54 9 11 2252-1639
              </div>
              <div className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                info@afinsrl.com.ar
              </div>
              <div className="footer-contact-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Martínez, Buenos Aires, Argentina
              </div>
            </div>
          </div>

          <div>
            <p className="footer-nav-title">Navegación</p>
            <Link href="/"              className="footer-nav-link">Inicio</Link>
            <Link href="/quienes-somos" className="footer-nav-link">Quiénes Somos</Link>
            <Link href="/productos"     className="footer-nav-link">Productos</Link>
            <Link href="/blog"          className="footer-nav-link">Blog</Link>
            <Link href="/contacto"      className="footer-nav-link">Contacto</Link>
          </div>

          <div>
            <p className="footer-nav-title">Productos</p>
            <Link href="/productos#tapas"      className="footer-nav-link">Tapas y Cierres</Link>
            <Link href="/productos#frascos"    className="footer-nav-link">Frascos</Link>
            <Link href="/productos#envases"    className="footer-nav-link">Envases Plásticos</Link>
            <Link href="/productos#dispensers" className="footer-nav-link">Bombas Vaporizadoras</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AFIN srl Todos los derechos reservados.</span>
          <span>Fabricación 100% Argentina</span>
        </div>
      </div>
    </footer>
  )
}
