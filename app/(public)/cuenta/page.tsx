'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type TipoFacturacion = 'personal' | 'empresa'

function formatCuit(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

export default function CuentaPage() {
  const [ready,         setReady]         = useState(false)
  const [expanded,      setExpanded]      = useState(false)
  const [activeSection, setActive]        = useState('foto')
  const [nombre,        setNombre]        = useState('')
  const [telefono,      setTelefono]      = useState('')
  const [direccion,     setDireccion]     = useState('')
  const [localidad,     setLocalidad]     = useState('')
  const [codigoPostal,  setCodigoPostal]  = useState('')
  const [tipo,          setTipo]          = useState<TipoFacturacion>('personal')
  const [dni,           setDni]           = useState('')
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [cuit,          setCuit]          = useState('')
  const [saving,        setSaving]        = useState<string | null>(null)
  const [msgs,          setMsgs]          = useState<Record<string, { ok: boolean; text: string }>>({})
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase
        .from('profiles')
        .select('nombre,empresa,telefono,direccion,localidad,codigo_postal,cuit,dni,tipo_facturacion')
        .eq('id', user.id).single()
      if (data) {
        setNombre(data.nombre ?? '')
        setTelefono(data.telefono ?? '')
        setDireccion(data.direccion ?? '')
        setLocalidad(data.localidad ?? '')
        setCodigoPostal(data.codigo_postal ?? '')
        setTipo((data.tipo_facturacion ?? 'personal') as TipoFacturacion)
        setDni(data.dni ?? '')
        setNombreEmpresa(data.empresa ?? '')
        setCuit(data.cuit ?? '')
      }
      setReady(true)
    }
    load()
  }, [router])

  // Resaltar sección activa al hacer scroll
  useEffect(() => {
    if (!ready) return
    const observers: IntersectionObserver[] = []
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id) },
        { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [ready])

  function showMsg(section: string, ok: boolean, text: string) {
    setMsgs(prev => ({ ...prev, [section]: { ok, text } }))
    if (ok) setTimeout(() => setMsgs(prev => { const n = { ...prev }; delete n[section]; return n }), 3000)
  }

  async function saveFields(section: string, fields: Record<string, unknown>) {
    setSaving(section)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(null); return }
    const { error } = await supabase.from('profiles').update(fields).eq('id', user.id)
    setSaving(null)
    showMsg(section, !error, error ? 'Error al guardar.' : 'Guardado correctamente.')
  }

  function saveDatos() {
    saveFields('datos', {
      nombre: nombre || null, telefono: telefono || null,
      direccion: direccion || null, localidad: localidad || null,
      codigo_postal: codigoPostal || null, tipo_facturacion: tipo,
      dni: tipo === 'personal' ? (dni || null) : null,
      empresa: tipo === 'empresa' ? (nombreEmpresa || null) : null,
      cuit: tipo === 'empresa' ? (cuit || null) : null,
    })
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const initials = nombre.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?'

  if (!ready) {
    return <div style={pageStyle}><p style={{ fontSize: 14, color: 'var(--fg-3)' }}>Cargando...</p></div>
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={h1Style}>Mi perfil</h1>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <nav
            style={{
              flexShrink: 0,
              width: expanded ? 208 : 52,
              transition: 'width 0.2s ease',
              position: 'sticky',
              top: 80,
              overflow: 'hidden',
            }}
          >
            {/* Botón toggle */}
            <button
              onClick={() => setExpanded(e => !e)}
              title={expanded ? 'Colapsar menú' : 'Expandir menú'}
              style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-end' : 'center', padding: expanded ? '0 10px' : '0', marginBottom: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronIcon expanded={expanded} />
            </button>

            {/* Items de navegación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map(({ id, label, Icon }) => {
                const active = activeSection === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    title={!expanded ? label : undefined}
                    style={{
                      width: '100%', height: 40,
                      display: 'flex', alignItems: 'center',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      gap: 10, padding: expanded ? '0 10px' : '0',
                      fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? 'var(--orange-600)' : 'var(--fg-2)',
                      background: active ? 'color-mix(in srgb, var(--orange-600) 8%, transparent)' : 'none',
                      border: 'none',
                      borderLeft: `2px solid ${active ? 'var(--orange-600)' : 'transparent'}`,
                      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'flex' }}>
                      <Icon size={17} color={active ? 'var(--orange-600)' : 'var(--fg-3)'} />
                    </span>
                    {expanded && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
                  </button>
                )
              })}
            </div>

            {/* Cerrar sesión */}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={handleSignOut}
                title={!expanded ? 'Cerrar sesión' : undefined}
                style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: expanded ? 'flex-start' : 'center', gap: 10, padding: expanded ? '0 10px' : '0', fontSize: 13, color: 'var(--error-600, #dc2626)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}
              >
                <span style={{ flexShrink: 0, display: 'flex' }}>
                  <SignOutIcon size={17} color="var(--error-600, #dc2626)" />
                </span>
                {expanded && 'Cerrar sesión'}
              </button>
            </div>
          </nav>

          {/* ── Secciones ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Foto de perfil */}
            <Section id="foto" label="Cambiar foto de perfil" Icon={CameraIcon}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'color-mix(in srgb, var(--orange-600) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'var(--orange-600)', flexShrink: 0, border: '2px solid var(--border)' }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>{nombre || 'Sin nombre'}</p>
                  <button disabled style={{ fontSize: 12, color: 'var(--fg-3)', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '5px 12px', cursor: 'not-allowed' }}>
                    Subir foto · Próximamente
                  </button>
                </div>
              </div>
            </Section>

            {/* Datos */}
            <Section id="datos" label="Datos" Icon={UserIcon}>
              <div style={formGrid}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldInput label="Nombre" value={nombre} onChange={setNombre} placeholder="Tu nombre completo" />
                </div>
                <FieldInput label="Teléfono / WhatsApp" value={telefono} onChange={setTelefono} placeholder="+54 9 11 1234-5678" inputMode="tel" />
                <FieldInput label="Dirección" value={direccion} onChange={setDireccion} placeholder="Calle 123, Piso 4" />
                <FieldInput label="Localidad" value={localidad} onChange={setLocalidad} placeholder="CABA" />
                <FieldInput label="Código postal" value={codigoPostal} onChange={setCodigoPostal} placeholder="1414" inputMode="numeric" />
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Tipo de datos fiscales</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['personal', 'empresa'] as TipoFacturacion[]).map(t => (
                    <button key={t} type="button" onClick={() => setTipo(t)} style={{ flex: 1, maxWidth: 140, padding: '8px 0', fontSize: 13, fontWeight: 500, border: `1px solid ${tipo === t ? 'var(--orange-600)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', background: tipo === t ? 'color-mix(in srgb, var(--orange-600) 10%, transparent)' : 'var(--bg-surface)', color: tipo === t ? 'var(--orange-600)' : 'var(--fg-2)', cursor: 'pointer' }}>
                      {t === 'personal' ? 'Personal' : 'Empresa'}
                    </button>
                  ))}
                </div>
              </div>

              {tipo === 'personal' && (
                <div style={{ marginTop: 14 }}>
                  <FieldInput label="DNI" value={dni} onChange={v => setDni(v.replace(/\D/g, '').slice(0, 8))} placeholder="12345678" inputMode="numeric" />
                </div>
              )}

              {tipo === 'empresa' && (
                <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Datos de la empresa</p>
                  <div style={formGrid}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <FieldInput label="Nombre de empresa" value={nombreEmpresa} onChange={setNombreEmpresa} placeholder="AFIN SRL" />
                    </div>
                    <FieldInput label="CUIT" value={cuit} onChange={v => setCuit(formatCuit(v))} placeholder="20-12345678-9" inputMode="numeric" />
                  </div>
                </div>
              )}

              <SaveRow loading={saving === 'datos'} msg={msgs['datos']} onSave={saveDatos} />
            </Section>

            {/* Preferencias */}
            <Section id="preferencias" label="Preferencias" Icon={SettingsIcon}>
              <p style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6 }}>
                Las preferencias de notificación y personalización estarán disponibles próximamente.
              </p>
            </Section>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ id, label, Icon, children }: {
  id: string; label: string; Icon: IconComponent; children: React.ReactNode
}) {
  return (
    <div id={id} style={{ scrollMarginTop: 88 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '22px 24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'color-mix(in srgb, var(--orange-600) 12%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color="var(--orange-600)" />
          </span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg-1)', margin: 0 }}>{label}</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Form helpers ──────────────────────────────────────────────────────────────

function FieldInput({ label, value, onChange, placeholder, inputMode, disabled }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  disabled?: boolean
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} disabled={disabled}
        style={{ ...inputStyle, opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : undefined }} />
    </div>
  )
}

function SaveRow({ loading, msg, onSave, disabled }: {
  loading: boolean; msg?: { ok: boolean; text: string }; onSave: () => void; disabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
      <button onClick={onSave} disabled={loading || disabled}
        style={{ padding: '8px 22px', fontSize: 13, fontWeight: 600, background: (loading || disabled) ? 'var(--neutral-300, #d4d4d4)' : 'var(--orange-600)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: (loading || disabled) ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
      {msg && (
        <span style={{ fontSize: 13, color: msg.ok ? 'var(--success-700, #15803d)' : 'var(--error-700, #b91c1c)' }}>
          {msg.text}
        </span>
      )}
    </div>
  )
}

// ── Iconos ────────────────────────────────────────────────────────────────────

type IconComponent = (props: { size: number; color: string }) => React.ReactElement

function CameraIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function UserIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BuildingIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

function SettingsIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function SignOutIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ── Constantes ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: string; label: string; Icon: IconComponent }[] = [
  { id: 'foto',         label: 'Cambiar foto de perfil', Icon: CameraIcon   },
  { id: 'datos',        label: 'Datos',                  Icon: UserIcon     },
  { id: 'preferencias', label: 'Preferencias',           Icon: SettingsIcon },
]

const pageStyle:  React.CSSProperties = { minHeight: '100vh', background: 'var(--bg-surface)', padding: '48px 16px 96px' }
const h1Style:    React.CSSProperties = { fontSize: 24, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 28 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', fontSize: 14, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', color: 'var(--fg-1)', outline: 'none', boxSizing: 'border-box' }
const formGrid:   React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }
