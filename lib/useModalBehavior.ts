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
