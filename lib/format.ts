export function formatCuit(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

// Supabase devuelve numeric(12,2) como string ("1330.00"). Formateamos como
// moneda argentina sin decimales → "$1.330". Sin valor → 'Consultar', que es
// el idiom que ya usa el catálogo para productos sin precio cargado.
export function formatARS(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'Consultar'
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n) ? ARS.format(n as number) : 'Consultar'
}
