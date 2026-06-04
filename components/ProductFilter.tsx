'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PRODUCTS, CATEGORIES } from '@/lib/products'

export default function ProductFilter() {
  const [activeCategory, setActiveCategory] = useState('todos')

  const filtered = activeCategory === 'todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory)

  const activeLabel = CATEGORIES.find(c => c.id === activeCategory)?.label ?? 'Todos los productos'

  return (
    <div className="products-layout">
      <aside className="products-sidebar" aria-label="Filtrar por categoría">
        <p className="sidebar-label">Categorías</p>

        {CATEGORIES.map((cat, i) => (
          <>
            {i === 1 && <div key="divider" className="sidebar-divider" />}
            <button
              key={cat.id}
              className={`filter-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="filter-label">{cat.label}</span>
              <span className="filter-count">{cat.count}</span>
            </button>
          </>
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
            <article key={product.id} className="product-card">
              <div className="product-card-image">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={280}
                  height={100}
                  style={{ objectFit: 'contain', padding: '8px', height: '100px', width: '100%' }}
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
  )
}
