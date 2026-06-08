'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/products'

interface Props {
  product: Product
  relatedProducts: Product[]
  onClose: () => void
  onSelectRelated?: (product: Product) => void
}

const BADGE_LABEL: Record<string, string> = { stock: 'En stock', consult: 'Consultar', new: 'Nuevo' }

export default function ProductModal({ product, relatedProducts, onClose, onSelectRelated }: Props) {
  const [imgIndex, setImgIndex] = useState(0)

  const images = product.images?.length ? product.images : [product.image]
  const related = relatedProducts.slice(0, 3)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setImgIndex(i => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setImgIndex(i => Math.min(images.length - 1, i + 1))
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, images.length])

  const waMessage = encodeURIComponent(`Hola! Me interesa el producto: ${product.name}`)

  return (
    <div
      className="product-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="product-modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

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
              <h2 className="product-modal-name">{product.name}</h2>
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

            <a
              href={`https://wa.me/5491122521639?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary product-modal-cta"
            >
              Consultar por WhatsApp
            </a>

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
                      onKeyDown={e => e.key === 'Enter' && onSelectRelated?.(rel)}
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
