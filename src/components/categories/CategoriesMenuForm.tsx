import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Category } from '../../services/categories.service'
import {
  getMenuCategories,
  updateCategoryMenu,
} from '../../services/categories.service'

type Props = {
  onSaved?: () => void
}

export default function CategoriesMenuForm({ onSaved }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await getMenuCategories()
      setCategories(data)
    } catch {
      toast.error('Erro ao carregar categorias do menu')
    }
  }

  function toggleCategory(id: number) {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, showInMenu: !cat.showInMenu }
          : cat
      )
    )
  }

async function handleSave() {
  try {
    setLoading(true)

    await Promise.all(
      categories.map(cat =>
        updateCategoryMenu(cat.id, cat.showInMenu)
      )
    )

    toast.success('Menu do site atualizado com sucesso')

    onSaved?.() // 🔥 avisa o pai
  } catch {
    toast.error('Erro ao salvar categorias do menu')
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">
          Categorias no Menu do site
        </h2>
        <p>São as Categorias que aparecem no Header do site. Se for selecionado uma categoria Raiz que tenha filhos, elas vão aparecer tambem automaticamente.</p>

        <div className="space-y-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="
                flex items-center justify-between
                border rounded-lg p-4
                dark:border-gray-700
              "
            >
              <span className="font-medium">
                {cat.name}
              </span>

              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition
                  ${cat.showInMenu ? 'bg-green-600' : 'bg-gray-400'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition
                    ${cat.showInMenu ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t dark:border-gray-700">
          <button
            disabled={loading}
            onClick={handleSave}
            className="
              px-5 py-2 text-sm font-medium rounded-md
              bg-gray-900 dark:bg-gray-100
              text-white dark:text-gray-900
              hover:bg-gray-800 dark:hover:bg-gray-200
              transition disabled:opacity-50
            "
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
