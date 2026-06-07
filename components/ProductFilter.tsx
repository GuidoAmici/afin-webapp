'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CATEGORIES, PRODUCTS, TOTAL_PRODUCTS, ALL_SUBCATEGORIES, Product } from '@/lib/products'
import ProductModal from './ProductModal'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export default function ProductFilter() {
  const [activeCategory, setActiveCategory]       = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct]     = useState<Product | null>(null)
  const [query, setQuery]                         = useState('')

  const q = normalize(query.trim())

  const filtered = PRODUCTS.filter(p => {
    const matchesSearch = !q || [p.name, p.categoryLabel, p.subcategoryLabel, p.description ?? '']
      .some(field => normalize(field).includes(q))
    const matchesCat = !activeSubcategory
      ? (!activeCategory || p.category === activeCategory)
      : p.subcategory === activeSubcategory
    return matchesSearch && matchesCat
  })

  const activeLabel = query.trim()
    ? `Resultados para "${query.trim()}"`
    : activeSubcategory
      ? ALL_SUBCATEGORIES.find(s => s.id === activeSubcategory)?.label
      : activeCategory
        ? CATEGORIES.find(c => c.id === activeCategory)?.label
        : 'Todos los productos'

  function selectCategory(catId: string) {
    if (activeCategory === catId) {
      setActiveCategory(null)
      setActiveSubcategory(null)
    } else {
      setActiveCategory(catId)
      setActiveSubcategory(null)
    }
  }

  function selectSubcategory(subId: string, parentId: string) {
    if (activeSubcategory === subId) {
      setActiveSubcategory(null)
    } else {
      setActiveCategory(parentId)
      setActiveSubcategory(subId)
    }
  }

  return (
    <>
      <div className="products-search-bar">
        <svg className="products-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          placeholder="Buscar producto… (ej: Tapa Flor, bomba 15, vantax)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Buscar productos"
        />
        {query && (
          <button className="products-search-clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
            ✕
          </button>
        )}
      </div>

      <div className="products-layout">
        <aside className="products-sidebar" aria-label="Filtrar por categoría">
          <p className="sidebar-label">Categorías</p>

          <button
            className={`filter-btn${!activeCategory ? ' active' : ''}`}
            onClick={() => { setActiveCategory(null); setActiveSubcategory(null) }}
          >
            <span className="filter-label">Todos los productos</span>
            <span className="filter-count">{TOTAL_PRODUCTS}</span>
          </button>

          <div className="sidebar-divider" />

          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button
                className={`filter-btn${activeCategory === cat.id && !activeSubcategory ? ' active' : ''}`}
                onClick={() => selectCategory(cat.id)}
              >
                <span className="filter-label">{cat.label}</span>
                <span className="filter-count">{cat.count}</span>
              </button>

              {activeCategory === cat.id && cat.subcategories.length > 0 && (
                <div className="filter-subcategories">
                  {cat.subcategories.filter(s => s.count > 0).map(sub => (
                    <button
                      key={sub.id}
                      className={`filter-btn filter-btn--sub${activeSubcategory === sub.id ? ' active' : ''}`}
                      onClick={() => selectSubcategory(sub.id, cat.id)}
                    >
                      <span className="filter-label">{sub.label}</span>
                      <span className="filter-count">{sub.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                  <p className="product-card-cat">{product.subcategoryLabel}</p>
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
