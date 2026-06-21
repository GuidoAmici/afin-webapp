'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

interface Options {
  /** Si es false, el hook no hace nada (útil para paneles que se muestran/ocultan sin desmontar). */
  active?: boolean
  /** Elemento que recibe el foco al abrir. Por defecto, el primer focusable del contenedor. */
  initialFocus?: React.RefObject<HTMLElement | null>
}

/**
 * Comportamiento estándar de modal: Escape para cerrar, trap de Tab,
 * bloqueo del scroll del body y restauración del foco al cerrar.
 */
export function useModalBehavior(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  { active = true, initialFocus }: Options = {}
) {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  const initialFocusRef = useRef(initialFocus)
  useEffect(() => { initialFocusRef.current = initialFocus })

  useEffect(() => {
    if (!active) return
    const container = ref.current
    const previousFocus = document.activeElement as HTMLElement | null

    const target = initialFocusRef.current?.current ?? container?.querySelector<HTMLElement>(FOCUSABLE)
    target?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCloseRef.current(); return }
      if (e.key !== 'Tab' || !container) return
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      previousFocus?.focus()
    }
  }, [active, ref])
}

/**
 * Props para el overlay/backdrop de un modal: cierra al clickear el fondo,
 * pero sólo si el gesto empezó Y terminó sobre el propio overlay. Se usa
 * `mouseup` (no `click`) porque su `target` es el elemento donde realmente
 * se soltó el mouse; el `target` de `click` es el ancestro común de
 * mousedown/mouseup, que sería el overlay aun si un extremo cae en la tarjeta.
 * Así, una selección que arranca dentro y suelta fuera —o al revés— no cierra.
 */
export function useOverlayDismiss(onClose: () => void) {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  const downOnOverlay = useRef(false)

  return {
    onMouseDown: (e: React.MouseEvent) => {
      downOnOverlay.current = e.target === e.currentTarget
    },
    onMouseUp: (e: React.MouseEvent) => {
      const dismiss = downOnOverlay.current && e.target === e.currentTarget
      downOnOverlay.current = false
      if (dismiss) onCloseRef.current()
    },
  }
}
