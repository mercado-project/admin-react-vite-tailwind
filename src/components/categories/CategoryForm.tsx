import { useEffect, useState } from 'react'
import type { Category } from '../../services/categories.service'
import { createCategory, updateCategory, deleteCategory } from '../../services/categories.service'
import toast from 'react-hot-toast'


type Props = {
  categories: Category[]
  category?: Category | null
  onSuccess: () => void
}

type FormState = {
  name: string
  description: string
  parentId: string
  active: boolean
  showInMenu: boolean
  url: string
  meta_title: string
  meta_description: string
  image_url: string
}

export default function CategoryForm({
  categories,
  category,
  onSuccess,
}: Props) {
const [form, setForm] = useState<FormState>({
  name: '',
  description: '',
  parentId: '',
  active: true,
  showInMenu: true,
  url: '',
  meta_title: '',
  meta_description: '',
  image_url: '',
})

  const [loading, setLoading] = useState(false)

  const [isEditing, setIsEditing] = useState(false)



  // ✅ PREENCHE O FORMULÁRIO AO SELECIONAR UMA CATEGORIA
useEffect(() => {
  if (category) {
    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
      parentId: category.parent?.id
        ? String(category.parent.id)
        : '',
      active: category.active ?? true,
      showInMenu: category.showInMenu ?? true,
      url: category.url ?? '',
      meta_title: category.meta_title ?? '',
      meta_description: category.meta_description ?? '',
      image_url: category.image_url ?? '',
    })

    setIsEditing(false) // 🔒 inicia bloqueado
  } else {
    setForm({
      name: '',
      description: '',
      parentId: '',
      active: true,
      showInMenu: true,
      url: '',
      meta_title: '',
      meta_description: '',
      image_url: '',
    })

    setIsEditing(true) // 🆕 nova categoria já editável
  }
}, [category])

async function handleDelete() {
  if (!category) return

  const confirmed = window.confirm(
    'Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.'
  )

  if (!confirmed) return

  try {
    await deleteCategory(category.id)
    toast.success('Categoria excluída com sucesso')
    onSuccess()
  } catch {
    toast.error('Erro ao excluir categoria')
  }
}



async function handleSubmit() {
  try {
    setLoading(true)

    const parent = form.parentId
      ? { id: Number(form.parentId) }
      : null

    const level = parent
      ? (categories.find(c => c.id === parent.id)?.level ?? 0) + 1
      : 0

    const payload = {
      name: form.name,
      description: form.description,
      parent,
      level,
      active: form.active,
      showInMenu: form.showInMenu,
      url: form.url,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      image_url: form.image_url || undefined,
    }

    if (category?.id) {
      // 🔵 UPDATE
      await updateCategory(category.id, payload)
      toast.success('Categoria atualizada com sucesso')
    } else {
      // 🟢 CREATE
      await createCategory(payload)
      toast.success('Categoria criada com sucesso')
    }

    onSuccess()
  } catch (error: any) {
    if (error?.response?.status === 409) {
      toast.error('Já existe uma categoria com essa URL')
    } else {
      toast.error('Erro ao salvar categoria')
    }
  } finally {
    setLoading(false)
  }
}



  return (
    <div className="max-w-4xl">
       <div className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">
            {category ? category.name : 'Nova categoria'}
          </h2>

          {category && (
            <div className="flex items-center justify-between">
              <div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="
                      inline-flex items-center
                      px-3 py-2
                      text-sm font-medium
                      rounded-md
                      border
                      transition

                      text-blue-700
                      border-blue-200
                      bg-blue-50
                      hover:bg-blue-100

                      dark:text-blue-400
                      dark:border-blue-900
                      dark:bg-blue-950/40
                      dark:hover:bg-blue-950/60
                    "
                  >
                    Editar Categoria
                  </button>
                )}
              </div>

              <button
                onClick={handleDelete}
                className="
                  inline-flex items-center
                  px-3 py-2
                  text-sm font-medium
                  rounded-md
                  border
                  transition

                  text-red-700
                  border-red-200
                  bg-red-50
                  hover:bg-red-100

                  dark:text-red-400
                  dark:border-red-900
                  dark:bg-red-950/40
                  dark:hover:bg-red-950/60
                "
              >
                Excluir Categoria
              </button>
            </div>
          )}
        </div>


        {/* Organização */}
        <div
          className={`
            ${!isEditing ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
        <section className="space-y-4">
          {/* <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Organização
          </h3> */}

          <div>
            <label className="text-sm font-medium mb-1 block">
              Categoria pai
            </label>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
              value={form.parentId}
              onChange={e =>
                setForm({ ...form, parentId: e.target.value })
              }
            >
              <option value="">Nenhuma (categoria raiz)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
            <div>
              <p className="font-medium">Categoria ativa</p>
              <p className="text-sm text-gray-500">
                Categorias inativas não aparecem no site
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm({ ...form, active: !form.active })
              }
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition
                ${form.active ? 'bg-green-600' : 'bg-gray-400'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${form.active ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
            <div>
              <p className="font-medium">Mostrar no menu do site</p>
              <p className="text-sm text-gray-500">
                Exibe esta categoria no menu principal
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm({ ...form, showInMenu: !form.showInMenu })
              }
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition
                ${form.showInMenu ? 'bg-green-600' : 'bg-gray-400'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition
                  ${form.showInMenu ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

        </section>

        {/* Informações básicas */}
        <br></br>
        <section className="space-y-4">
          <Input
            label="Nome da categoria"
            value={form.name}
            onChange={v => setForm({ ...form, name: v })}
          />

          <Textarea
            label="Descrição"
            value={form.description}
            onChange={v => setForm({ ...form, description: v })}
          />

          <Input
            label="URL (Apenas o nome, sem o '/')"
            value={form.url}
            onChange={v => setForm({ ...form, url: v })}
          />
        </section>

        {/* SEO */}
        <br></br>
        <section className="space-y-4">
          <Input
            label="Meta title"
            value={form.meta_title}
            onChange={v =>
              setForm({ ...form, meta_title: v })
            }
          />

          <Textarea
            label="Meta description"
            value={form.meta_description}
            onChange={v =>
              setForm({ ...form, meta_description: v })
            }
          />

          <Input
            label="Imagem (URL)"
            value={form.image_url}
            onChange={v =>
              setForm({ ...form, image_url: v })
            }
          />
        </section>

        {/* Ações */}
        <br></br>
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="
                px-5 py-2 text-sm font-medium rounded-md
                bg-gray-900 dark:bg-gray-100
                text-white dark:text-gray-900
                hover:bg-gray-800 dark:hover:bg-gray-200
                transition disabled:opacity-50
              "
            >
              Salvar Categoria
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

// /* ---------- Inputs ---------- */

type InputProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">
        {label}
      </label>
      <input
        className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

type TextareaProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function Textarea({
  label,
  value,
  onChange,
}: TextareaProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">
        {label}
      </label>
      <textarea
        rows={3}
        className="w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
