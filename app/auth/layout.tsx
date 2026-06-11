import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      padding: '24px 16px',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange-600)', letterSpacing: '-0.5px' }}>
            AFIN srl
          </span>
        </Link>
      </div>
      {children}
    </div>
  )
}
