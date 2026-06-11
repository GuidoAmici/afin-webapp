'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/products'
import { useCart } from '@/lib/cart'

interface Props {
  product: Product
  relatedProducts: Product[]
  onClose: () => void
  onSelectRelated?: (product: Product) => void
}

const BADGE_LABEL: Record<string, string> = { stock: 'En stock', consult: 'Consultar', new: 'Nuevo' }

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export default function ProductModal({ product, relatedProducts, onClose, onSelectRelated }: Props) {
  const [imgIndex, setImgIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { add } = useCart()

  const images = product.images?.length ? product.images : [product.image]
  const related = relatedProducts.slice(0, 3)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement
    closeButtonRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowLeft') { setImgIndex(i => Math.max(0, i - 1)); return }
      if (e.key === 'ArrowRight') { setImgIndex(i => Math.min(images.length - 1, i + 1)); return }
      if (e.key === 'Tab') {
        const modal = modalRef.current
        if (!modal) return
        const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE))
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
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
      previousFocus?.focus()
    }
  }, [onClose, images.length])

  const waMessage = encodeURIComponent(`Hola! Me interesa el producto: ${product.name}`)

  return (
    <div
      className="product-modal-overlay"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="product-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-product-title"
      >
        <button ref={closeButtonRef} className="product-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="product-modal-body">
          {/* Carrusel */}
          <div className="product-modal-carousel">
            <div className="product-modal-img-wrap">
              <Image
                src={images[imgIndex]}
                alt={product.name}
                fill
                style={{ objectFit: 'contain', padding: '24px' }}
                priority
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  className="carousel-btn carousel-btn-prev"
                  onClick={() => setImgIndex(i => Math.max(0, i - 1))}
                  disabled={imgIndex === 0}
                  aria-label="Imagen anterior"
                >‹</button>
                <button
                  className="carousel-btn carousel-btn-next"
                  onClick={() => setImgIndex(i => Math.min(images.length - 1, i + 1))}
                  disabled={imgIndex === images.length - 1}
                  aria-label="Imagen siguiente"
                >›</button>
                <div className="carousel-dots" role="tablist">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === imgIndex}
                      className={`carousel-dot${i === imgIndex ? ' active' : ''}`}
                      onClick={() => setImgIndex(i)}
                      aria-label={`Imagen ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Info */}
          <div className="product-modal-info">
            <p className="product-card-cat">{product.categoryLabel}</p>

            <div className="product-modal-title-row">
              <h2 id="modal-product-title" className="product-modal-name">{product.name}</h2>
              <span className={`badge badge-${product.badge}`}>{BADGE_LABEL[product.badge]}</span>
            </div>

            {product.description && (
              <p className="product-modal-desc">{product.description}</p>
            )}

            <div className="product-modal-prices">
              <div className="price-card">
                <span className="price-label">Precio por menor</span>
                <span className="price-value">{product.priceRetail ?? 'Consultar'}</span>
                <span className="price-min">mínimo: 1 unidad</span>
              </div>
              <div className="price-card price-card-wholesale">
                <span className="price-label">Precio por mayor</span>
                <span className="price-value">{product.priceWholesale ?? 'Consultar'}</span>
                <span className="price-min">mínimo: 100 unidades</span>
              </div>
            </div>

            {product.badge === 'stock' && (
              <button
                className="btn-primary product-modal-cta"
                onClick={() => {
                  add({ productId: product.id, productName: product.name, image: product.image, unitPrice: product.priceRetail })
                  setAdded(true)
                  setTimeout(() => setAdded(false), 2000)
                }}
              >
                {added ? '✓ Agregado al pedido' : 'Agregar al pedido'}
              </button>
            )}
            {product.badge === 'consult' && (
              <a
                href={`https://wa.me/5491122521639?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary product-modal-cta"
              >
                Consultar por WhatsApp
              </a>
            )}
            {product.badge === 'new' && (
              <button className="btn-primary product-modal-cta" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Próximamente
              </button>
            )}

            {related.length > 0 && (
              <div className="product-modal-related">
                <p className="product-modal-related-title">Productos relacionados</p>
                <div className="product-modal-related-grid">
                  {related.map(rel => (
                    <div
                      key={rel.id}
                      className="product-modal-related-card"
                      onClick={() => onSelectRelated?.(rel)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRelated?.(rel) }
                      }}
                    >
                      <div className="product-modal-related-img">
                        <Image
                          src={rel.image}
                          alt={rel.name}
                          width={80}
                          height={64}
                          style={{ objectFit: 'contain', padding: '4px' }}
                        />
                      </div>
                      <p className="product-modal-related-name">{rel.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
