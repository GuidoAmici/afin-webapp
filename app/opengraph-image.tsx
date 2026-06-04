import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const alt = 'Afin SRL — Fábrica de tapas y envases plásticos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const logoData = readFileSync(path.join(process.cwd(), 'public/images/logo-transparent.png'))
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #6B2500 0%, #BE4900 60%, #D45710 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '60px 80px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={100} height={100} alt="" style={{ borderRadius: 18 }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Afin SRL
          </div>

          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              maxWidth: 780,
              lineHeight: 1.45,
            }}
          >
            Tapas, cierres y envases plásticos para la industria cosmética, farmacéutica y de perfumería.
          </div>
        </div>

        <div
          style={{
            marginTop: 8,
            background: 'rgba(255,255,255,0.13)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 999,
            padding: '10px 28px',
            fontSize: 16,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Fabricación 100% Argentina
        </div>
      </div>
    ),
    { ...size }
  )
}
