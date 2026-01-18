import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import ProductsGrid from '../components/products/ProductsGrid'
import ProductView from '../components/products/ProductView'
import { getAllProducts } from '../services/products.service'
import type { Product } from '../services/products.service'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  async function loadProducts() {
    const data = await getAllProducts()
    setProducts(data)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  return (
    <AdminLayout>
      <div className="flex h-full gap-6 overflow-hidden">

        {/* GRID */}
        <aside className="
          w-[55%]
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          overflow-hidden
          flex flex-col
        ">
          <ProductsGrid
            products={products}
            selectedId={selected?.id}
            onSelect={(product) => {
              setSelected(product)
              setIsCreating(false)
            }}
            onAdd={() => {
              setSelected(null)
              setIsCreating(true)
            }}
          />
        </aside>

        {/* DETALHE */}
        <section className="
          flex-1
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          p-6
          overflow-y-auto
        ">
          {/* NADA SELECIONADO */}
          {!selected && !isCreating && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Selecione um produto
            </div>
          )}

          {/* CRIAÇÃO */}
          {isCreating && (
            <ProductView
              product={null}
              onSuccess={() => {
                loadProducts()
                setSelected(null)
                setIsCreating(false)
              }}
            />
          )}

          {/* EDIÇÃO */}
          {selected && (
            <ProductView
              product={selected}
              onSuccess={() => {
                loadProducts()
                setSelected(null)
                setIsCreating(false)
              }}
            />
          )}
        </section>

      </div>
    </AdminLayout>
  )
}
