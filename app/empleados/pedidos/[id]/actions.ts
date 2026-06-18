'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Axis } from '@/lib/order-transitions'

// Mensajes de error de Postgres → texto legible para el panel. La autorización
// y la validación de la máquina de estados las hace transition_order; acá solo
// traducimos los errores más comunes para no mostrar jerga de la DB.
function humanizeError(message: string): string {
  if (message.includes('rol insuficiente')) return 'No tenés permiso para esta acción.'
  if (message.includes('transición inválida')) return 'Esa transición no está permitida desde el estado actual.'
  if (message.includes('no está pagado')) return 'No se puede preparar: el pedido no está pagado ni tiene crédito habilitado.'
  if (message.includes('no autenticado')) return 'Tu sesión expiró. Volvé a iniciar sesión.'
  return message
}

/**
 * Ejecuta una transición de estado de un pedido a través de transition_order
 * (cuello único, ADR-006). La función Postgres autoriza por JWT; igual
 * verificamos staff acá para fallar limpio antes del round-trip.
 */
export async function transitionOrderAction(input: {
  orderId: string
  axis: Axis
  to: string
  motivo?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  if (role !== 'empleado' && role !== 'admin') return { error: 'No autorizado.' }

  const motivo = input.motivo?.trim()
  const { error } = await supabase.rpc('transition_order', {
    p_order_id: input.orderId,
    p_axis: input.axis,
    p_to: input.to,
    p_metadata: motivo ? { nota: motivo } : {},
  })

  if (error) return { error: humanizeError(error.message) }

  revalidatePath(`/empleados/pedidos/${input.orderId}`)
  revalidatePath('/empleados/pedidos')
  return {}
}
