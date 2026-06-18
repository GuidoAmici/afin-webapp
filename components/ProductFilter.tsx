'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { catalogBadge, type Category, type Product } from '@/lib/products'
import ProductModal from './ProductModal'
import { SearchIcon } from './icons'

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

interface Props {
  categories: Category[]
  products: Product[]
}

export default function ProductFilter({ categories, products }: Props) {
  const searchParams = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [query, setQuery] = useState('')

  const allSubcategories = categories.flatMap(c => c.subcategories)

  // La URL es la fuente de verdad para cat/sub: filtros compartibles y
  // navegables con atrás/adelante. Valores desconocidos se ignoran.
  const rawSub = searchParams.get('sub')
  const activeSub = allSubcategories.find(s => s.id === rawSub) ?? null
  const rawCat = searchParams.get('cat')
  const activeCategory = activeSub?.parentId ?? (categories.some(c => c.id === rawCat) ? rawCat : null)
  const activeSubcategory = activeSub?.id ?? null

  function applyFilter(cat: string | null, sub: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) params.set('cat', cat); else params.delete('cat')
    if (sub) params.set('sub', sub); else params.delete('sub')
    const qs = params.toString()
    window.history.pushState(null, '', qs ? `?${qs}` : window.location.pathname)
  }

  const q = normalize(query.trim())

  const filtered = products.filter(p => {
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
      ? allSubcategories.find(s => s.id === activeSubcategory)?.label
      : activeCategory
        ? categories.find(c => c.id === activeCategory)?.label
        : 'Todos los productos'

  function selectCategory(catId: string) {
    if (activeCategory === catId) {
      applyFilter(null, null)
    } else {
      applyFilter(catId, null)
    }
  }

  function selectSubcategory(subId: string, parentId: string) {
    if (activeSubcategory === subId) {
      applyFilter(parentId, null)
    } else {
      applyFilter(parentId, subId)
    }
  }

  return (
    <>
      <div className="products-search-bar">
        <SearchIcon size={18} className="products-search-icon" />
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
            onClick={() => applyFilter(null, null)}
          >
            <span className="filter-label">Todos los productos</span>
            <span className="filter-count">{products.length}</span>
          </button>

          <div className="sidebar-divider" />

          {categories.map(cat => (
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
              <div
                key={product.id}
                className="product-card"
                onClick={() => setSelectedProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProduct(product) }
                }}
              >
                <div className="product-card-image">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={280}
                    height={280}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    loading="lazy"
                  />
                </div>
                <div className="product-card-body">
                  <p className="product-card-cat">{product.subcategoryLabel}</p>
                  <h3 className="product-card-name">{product.name}</h3>
                </div>
                <div className="product-card-footer">
                  <span className="product-card-link">Ver detalle →</span>
                  {(() => {
                    const badge = catalogBadge(product)
                    return <span className={`badge badge-${badge.variant}`}>{badge.label}</span>
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          key={selectedProduct.id}
          product={selectedProduct}
          relatedProducts={products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onSelectRelated={setSelectedProduct}
        />
      )}
    </>
  )
}
