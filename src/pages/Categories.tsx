import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import { getAllCategories } from '../services/categories.service'
import type { Category } from '../services/categories.service'
import CategoryTree from '../components/categories/CategoryTree'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Category | null>(null)

  useEffect(() => {
    getAllCategories().then(setCategories)
  }, [])

  return (
    <AdminLayout>
      <div className="flex h-full gap-6">
        {/* Árvore */}
        <aside className="w-80 bg-white dark:bg-gray-900 border rounded-xl p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-4 text-gray-500 uppercase">
            Categorias
          </h2>

          <CategoryTree
            categories={categories}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </aside>

        {/* Conteúdo da categoria */}
        <section className="flex-1 bg-white dark:bg-gray-900 border rounded-xl p-6">
          {selected ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {selected.name}
              </h2>

              <p className="text-gray-500">
                ID: {selected.id}
              </p>
            </>
          ) : (
            <p className="text-gray-400">
              Selecione uma categoria à esquerda
            </p>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
