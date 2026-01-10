import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout'
import { getAllCategories } from '../services/categories.service'
import type { Category } from '../services/categories.service'
import CategoryTree from '../components/categories/CategoryTree'
import CategoryForm from '../components/categories/CategoryForm'
import CategoriesMenuForm from '../components/categories/CategoriesMenuForm'

type ViewMode = 'empty' | 'view' | 'create' | 'menu'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Category | null>(null)
  const [mode, setMode] = useState<ViewMode>('empty')

  const reloadCategories = async () => {
    const data = await getAllCategories()
    setCategories(data)
  }

  useEffect(() => {
    reloadCategories()
  }, [])

  return (
    <AdminLayout>
      <div className="flex h-full gap-6 overflow-hidden">
        {/* Árvore */}
        <aside className="
          w-80
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          p-4
          overflow-y-auto
        ">


          <button
            onClick={() => {
              setSelected(null)
              setMode('create')
            }}
            className={`
              w-full mb-4 px-4 py-2
              text-sm font-medium
              rounded-md
              border
              transition

              ${
                mode === 'create' && !selected
                  ? `
                    bg-blue-100 text-blue-800 border-blue-300
                    dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800
                  `
                  : `
                    bg-gray-100 text-gray-800 border-gray-300
                    hover:bg-blue-50 hover:border-blue-200
                    dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
                    dark:hover:bg-blue-900/20
                  `
              }
            `}
          >
            + Criar nova categoria
          </button>

          <button
            onClick={() => {
              setSelected(null)
              setMode('menu')
            }}
            className={`
              w-full mb-4 px-4 py-2
              text-sm font-medium
              rounded-md
              border
              transition

              ${
                mode === 'menu'
                  ? `
                    bg-blue-100 text-blue-800 border-blue-300
                    dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800
                  `
                  : `
                    bg-gray-100 text-gray-800 border-gray-300
                    hover:bg-gray-200
                    dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700
                    dark:hover:bg-gray-700
                  `
              }
            `}
          >
            Categorias no Menu do site
          </button>

          <h2 className="text-sm font-semibold mb-4 text-gray-500 uppercase">
            Todas as Categorias
          </h2>

          <CategoryTree
            categories={categories}
            selectedId={selected?.id}
            onSelect={cat => {
              setSelected(cat)
              setMode('create') // 👈 abre o form preenchido
            }}
          />
        </aside>

        {/* Conteúdo */}
        <section className="
          flex-1
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          p-6
          flex flex-col
          overflow-y-auto
          min-h-0
        ">
          {/* Estado vazio */}
          {mode === 'empty' && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Selecione uma categoria
                </h2>
                <p className="text-gray-500">
                  Ou crie uma nova categoria para começar
                </p>
              </div>
            </div>
          )}

          {/* Visualização */}
          {mode === 'view' && selected && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {selected.name}
              </h2>
              <p className="text-gray-500">ID: {selected.id}</p>
            </>
          )}

          {/* Criação */}
          {mode === 'create' && (
            <CategoryForm
              categories={categories}
              category={selected}
              onSuccess={() => {
                reloadCategories()
                setMode('empty')
                setSelected(null)
              }}
            />
          )}
            {/* ⭐ MENU DO SITE */}
            {mode === 'menu' && (
              <CategoriesMenuForm
                onSaved={async () => {
                  await reloadCategories()
                  setSelected(null) // evita form com dado velho
                  setMode('empty')
                }}
              />
            )}
        </section>
      </div>
    </AdminLayout>
  )
}

