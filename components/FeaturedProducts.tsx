'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/products'
import ProductModal from './ProductModal'

interface Props {
  products: Product[]
}

export default function FeaturedProducts({ products }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <>
      <div className="product-grid">
        {products.map(product => (
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
          </div>
        ))}
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
