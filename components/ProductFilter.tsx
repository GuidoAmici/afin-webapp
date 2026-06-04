'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { PRODUCTS, CATEGORIES, Product } from '@/lib/products'
import ProductModal from './ProductModal'

export default function ProductFilter() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filtered = activeCategory === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory)

  const activeLabel = CATEGORIES.find(c => c.id === activeCategory)?.label ?? 'Todos los productos'

  return (
    <>
      <div className="products-layout">
        <aside className="products-sidebar" aria-label="Filtrar por categoría">
          <p className="sidebar-label">Categorías</p>

          {CATEGORIES.map((cat, i) => (
            <Fragment key={cat.id}>
              {i === 1 && <div className="sidebar-divider" />}
              <button
                className={`filter-btn${activeCategory === cat.id ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="filter-label">{cat.label}</span>
                <span className="filter-count">{cat.count}</span>
              </button>
            </Fragment>
          ))}
        </aside>

        <div className="products-main">
          <div className="products-main-header">
            <div>
              <h1>{activeLabel}</h1>
              <p>{filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="products-grid">
            {filtered.map(product => (
              <article
                key={product.id}
                className="product-card"
                onClick={() => setSelectedProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedProduct(product)}
              >
                <div className="product-card-image">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={280}
                    height={160}
                    style={{ objectFit: 'cover', height: '160px', width: '100%' }}
                    loading="lazy"
                  />
                </div>
                <div className="product-card-body">
                  <p className="product-card-cat">{product.categoryLabel}</p>
                  <h3 className="product-card-name">{product.name}</h3>
                </div>
                <div className="product-card-footer">
                  <span className="product-card-link">Ver detalle →</span>
                  <span className={`badge badge-${product.badge}`}>
                    {product.badge === 'stock' ? 'En stock' : 'Consultar'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSelectRelated={setSelectedProduct}
        />
      )}
    </>
  )
}
