'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { catalogBadge, type Product } from '@/lib/products'
import { useCart } from '@/lib/cart'
import { useModalBehavior } from '@/lib/useModalBehavior'
import { formatARS } from '@/lib/format'

interface Props {
  product: Product
  relatedProducts: Product[]
  onClose: () => void
  onSelectRelated?: (product: Product) => void
}

export default function ProductModal({ product, relatedProducts, onClose, onSelectRelated }: Props) {
  const [imgIndex, setImgIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const [qty, setQtyRaw] = useState(1)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { add } = useCart()

  function setQty(val: number) { setQtyRaw(Math.max(1, val)) }

  function handleQtyInput(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10)
    if (!isNaN(n)) setQty(n)
    else if (e.target.value === '') setQtyRaw(1)
  }

  const images = product.images?.length ? product.images : [product.image]
  const related = relatedProducts.slice(0, 3)

  useModalBehavior(modalRef, onClose, { initialFocus: closeButtonRef })

  // Navegación del carrusel con flechas del teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setImgIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setImgIndex(i => Math.min(images.length - 1, i + 1))
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [images.length])

  const waMessage = encodeURIComponent(`Hola! Me interesa el producto: ${product.name}`)
  const badge = catalogBadge(product)

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
                <div className="carousel-dots">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      className={`carousel-dot${i === imgIndex ? ' active' : ''}`}
                      onClick={() => setImgIndex(i)}
                      aria-label={`Ir a imagen ${i + 1}`}
                      aria-current={i === imgIndex}
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
              <span className={`badge badge-${badge.variant}`}>{badge.label}</span>
            </div>

            {product.description && (
              <p className="product-modal-desc">{product.description}</p>
            )}

            <div className="product-modal-prices">
              <div className="price-card">
                <span className="price-label">Precio por menor</span>
                <span className="price-value">{formatARS(product.priceRetail)}</span>
                <span className="price-min">mínimo: 1 unidad</span>
              </div>
              <div className="price-card price-card-wholesale">
                <span className="price-label">Precio por mayor</span>
                <span className="price-value">{formatARS(product.priceWholesale)}</span>
                <span className="price-min">mínimo: 100 unidades</span>
              </div>
            </div>

            {product.stockStatus === 'en_stock' && (
              <>
                {/* Sin stock disponible no bloquea la compra: el pedido sigue y, al
                    pagar, entra en espera de stock con aviso de demora (ADR-007). */}
                {!product.inStock && (
                  <p className="product-modal-stock-note" style={{ fontSize: 13, color: 'var(--orange-700)', margin: '0 0 10px' }}>
                    Sin stock inmediato — podés pedirlo igual; puede demorar.
                  </p>
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button onClick={() => setQty(qty - 1)} style={qtyBtnStyle} aria-label="Restar">−</button>
                    <input
                      type="number"
                      min={1}
                      value={qty}
                      onChange={handleQtyInput}
                      onBlur={() => setQty(qty)}
                      style={{ width: 48, textAlign: 'center', border: 'none', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '8px 4px', fontSize: 14, fontWeight: 600, background: 'var(--bg-surface)', color: 'var(--fg-1)', outline: 'none' }}
                    />
                    <button onClick={() => setQty(qty + 1)} style={qtyBtnStyle} aria-label="Sumar">+</button>
                  </div>
                  <button
                    className="btn-primary product-modal-cta"
                    style={{ flex: 1, margin: 0 }}
                    onClick={() => {
                      add({ productId: product.id, productName: product.name, image: product.image, unitPrice: product.priceRetail }, qty)
                      setAdded(true)
                      setTimeout(() => setAdded(false), 2000)
                    }}
                  >
                    {added ? '✓ Agregado' : 'Agregar al pedido'}
                  </button>
                </div>
              </>
            )}
            {product.stockStatus === 'consultar' && (
              <a
                href={`https://wa.me/5491122521639?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary product-modal-cta"
              >
                Consultar por WhatsApp
              </a>
            )}
            {product.stockStatus === 'proximamente' && (
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

const qtyBtnStyle: React.CSSProperties = {
  width: 36, height: 36, border: 'none', background: 'var(--bg-surface)',
  cursor: 'pointer', fontSize: 16, color: 'var(--fg-2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
