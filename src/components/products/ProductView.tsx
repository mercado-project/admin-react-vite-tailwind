// import type { Product } from '../../services/products.service'

// type Props = {
//   product: Product
// }

// export default function ProductView({ product }: Props) {
//   return (
//     <div className="space-y-6 max-w-3xl">
//       {/* Header */}
//       <div className="flex justify-between items-start">
//         <div>
//           <h2 className="text-xl font-semibold">
//             {product.name}
//           </h2>
//           <p className="text-sm text-gray-500">
//             SKU: {product.sku}
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <button className="
//             px-4 py-2 text-sm rounded-md
//             bg-blue-600 text-white
//             hover:bg-blue-700
//           ">
//             Editar
//           </button>

//           <button className="
//             px-4 py-2 text-sm rounded-md
//             bg-red-100 text-red-700
//             hover:bg-red-200
//             dark:bg-red-900/40 dark:text-red-300
//           ">
//             Excluir
//           </button>
//         </div>
//       </div>

//       {/* Dados */}
//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div>
//           <span className="text-gray-500">Categoria</span>
//           <p>{product.category?.name}</p>
//         </div>

//         <div>
//           <span className="text-gray-500">URL</span>
//           <p>{product.url}</p>
//         </div>

//         <div>
//           <span className="text-gray-500">Marca</span>
//           <p>{product.brand}</p>
//         </div>

//         <div>
//           <span className="text-gray-500">Estoque</span>
//           <p>{product.stocks?.[0]?.quantity ?? '-'}</p>
//         </div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import type { Product } from '../../services/products.service'
import {
  updateProduct,
  deleteProduct,
  createProductImage,
  createProductPrice,
  createProduct
} from '../../services/products.service'
import toast from 'react-hot-toast'
import { getAllCategories } from '../../services/categories.service'
import type { Category } from '../../services/categories.service'

type Props = {
  product: Product | null
  onSuccess: () => void
}

type FormState = {
  name: string
  description: string
  sku: string
  url: string
  brand: string
  categoryId: string
  active: boolean
  meta_title: string
  meta_description: string
  price: string

  mainImage: string
  extraImages: string[]
}

export default function ProductView({
  product,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    sku: '',
    url: '',
    brand: '',
    categoryId: '',
    active: true,
    meta_title: '',
    meta_description: '',
    price: '',
    mainImage: '',
    extraImages: [],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [extraImageInput, setExtraImageInput] = useState('')


  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {
        toast.error('Erro ao carregar categorias')
      })
  }, [])

  /* -------------------- */
  /* Load product         */
  /* -------------------- */

useEffect(() => {
  // 👉 MODO CRIAÇÃO
  if (!product) {
    setForm({
      name: '',
      description: '',
      sku: '',
      url: '',
      brand: '',
      categoryId: '',
      active: true,
      meta_title: '',
      meta_description: '',
      price: '',
      mainImage: '',
      extraImages: [],
    })

    // IMPORTANTE:
    // ProductView NÃO decide mais se está criando
    // Quem decide é o Products.tsx
    setIsEditing(true)
    return
  }

  // 👉 MODO EDIÇÃO
  setForm({
    name: product.name ?? '',
    description: product.description ?? '',
    sku: product.sku ?? '',
    url: product.url ?? '',
    brand: product.brand ?? '',
    categoryId: product.category?.id
      ? String(product.category.id)
      : '',
    active: product.active ?? true,
    meta_title: product.meta_title ?? '',
    meta_description: product.meta_description ?? '',
    price: product.prices?.[0]?.price ?? '',
    mainImage:
      product.images?.find(i => i.is_main)?.image_url ?? '',
    extraImages:
      product.images
        ?.filter(i => !i.is_main)
        .map(i => i.image_url) ?? [],
  })

  setIsEditing(false)
}, [product])










  /* -------------------- */
  /* Actions              */
  /* -------------------- */
  async function handleDelete() {
    if (!product) return

    const confirmed = window.confirm(
      'Deseja excluir este produto? Esta ação não pode ser desfeita.'
    )

    if (!confirmed) return

    try {
      await deleteProduct(product.id)
      toast.success('Produto excluído com sucesso')
      onSuccess()
    } catch {
      toast.error('Erro ao excluir produto')
    }
  }

async function handleSubmit() {
  try {
    setLoading(true)

    let productId: number | undefined = product?.id

    /* -------------------- */
    /* CREATE PRODUCT       */
    /* -------------------- */
    if (!product) {
      const created = await createProduct({
        name: form.name,
        description: form.description,
        sku: form.sku,
        url: form.url,
        brand: form.brand,
        active: form.active,
        category: form.categoryId ? Number(form.categoryId) : null,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
      })

      productId = created.id
    }

    /* -------------------- */
    /* UPDATE PRODUCT       */
    /* -------------------- */
    if (product && productId) {
      await updateProduct(productId, {
        name: form.name,
        description: form.description,
        sku: form.sku,
        url: form.url,
        brand: form.brand,
        active: form.active,
        categoryId: form.categoryId
          ? Number(form.categoryId)
          : null,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
      })
    }

    /* 🚨 GARANTIA ABSOLUTA */
    if (!productId) {
      throw new Error('ID do produto não encontrado')
    }

    /* -------------------- */
    /* PRICE                */
    /* -------------------- */
    if (form.price) {
      await createProductPrice({
        productId,
        price: Number(form.price),
      })
    }

    /* -------------------- */
    /* IMAGES               */
    /* -------------------- */
    if (form.mainImage) {
      await createProductImage({
        productId,
        image_url: form.mainImage,
        is_main: true,
      })
    }

    for (const img of form.extraImages) {
      await createProductImage({
        productId,
        image_url: img,
        is_main: false,
      })
    }

    toast.success(
      product ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso'
    )

    onSuccess()
    setIsEditing(false)
  } catch (err) {
    toast.error('Erro ao salvar produto')
  } finally {
    setLoading(false)
  }
}



  /* -------------------- */
  /* Render               */
  /* -------------------- */
  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-6 space-y-8">

        {/* HEADER */}
        <div className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">
              {product ? product.name : 'Novo Produto'}
            </h2>

            {product && (
              <p className="text-sm text-gray-500">
                SKU: {product.sku}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div>
              {!isEditing && product && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="
                    px-3 py-2 text-sm rounded-md border
                    bg-blue-50 text-blue-700 border-blue-200
                    hover:bg-blue-100
                  "
                >
                  Editar Produto
                </button>
              )}
            </div>

            {product && (
              <button
                onClick={handleDelete}
                className="
                  px-3 py-2 text-sm rounded-md border
                  bg-red-50 text-red-700 border-red-200
                  hover:bg-red-100
                "
              >
                Excluir Produto
              </button>
            )}
          </div>
        </div>


        {/* FORM */}
        <div
          className={`${!isEditing ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <section className="flex flex-col gap-4">

            <Input label="Nome" value={form.name} onChange={(v : string) => setForm({ ...form, name: v })} />
            <Input label="SKU" value={form.sku} onChange={(v : string) => setForm({ ...form, sku: v })} />
            <Input label="URL" value={form.url} onChange={(v : string) => setForm({ ...form, url: v })} />
            <Input label="Marca" value={form.brand} onChange={(v : string) => setForm({ ...form, brand: v })} />

            <Select
              label="Categoria"
              value={form.categoryId}
              options={categories}
              onChange={(v : string) => setForm({ ...form, categoryId: v })}
            />

            <Input label="Preço" value={form.price} onChange={(v : string) => setForm({ ...form, price: v })} />

            <Textarea
              label="Descrição"
              value={form.description}
              onChange={(v : string) => setForm({ ...form, description: v })}
            />

            <Textarea
              label="Meta description"
              value={form.meta_description}
              onChange={(v : string) => setForm({ ...form, meta_description: v })}
            />

            <div>
              <label className="text-sm font-medium">
                Imagem principal (URL)
              </label>

              <div className="flex gap-4 items-start">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  value={form.mainImage}
                  onChange={e =>
                    setForm({ ...form, mainImage: e.target.value })
                  }
                />

                {form.mainImage && (
                  <img
                    src={form.mainImage}
                    alt="Imagem principal"
                    className="w-24 h-24 object-cover rounded border"
                    onError={e =>
                      ((e.target as HTMLImageElement).style.display =
                        'none')
                    }
                  />
                )}
              </div>
            </div>


            <div>
              <label className="text-sm font-medium">
                Imagens secundárias
              </label>

              <div className="flex gap-2 mt-1">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  placeholder="URL da imagem"
                  value={extraImageInput}
                  onChange={e => setExtraImageInput(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!extraImageInput.trim()) return

                    setForm({
                      ...form,
                      extraImages: [
                        ...form.extraImages,
                        extraImageInput.trim(),
                      ],
                    })

                    setExtraImageInput('')
                  }}
                  className="
                  px-4 py-2 text-sm font-medium rounded-md
                  bg-green-600 text-white
                  hover:bg-green-700
                  dark:bg-green-500 dark:hover:bg-green-600
                  "
                >
                  Adicionar
                </button>
              </div>

              {form.extraImages.length > 0 && (
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {form.extraImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            extraImages: form.extraImages.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                        className="
                          absolute top-1 right-1
                          bg-black/70 text-white text-xs
                          rounded-full w-5 h-5
                          flex items-center justify-center
                          opacity-0 group-hover:opacity-100
                        "
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


          </section>

          {isEditing && (
            <div className="flex justify-end pt-6 border-t">
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="
                  px-5 py-2 text-sm rounded-md
                  bg-gray-900 text-white
                  hover:bg-gray-800
                  disabled:opacity-50
                "
              >
                {product ? 'Salvar Produto' : 'Criar Produto'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------- */
/* Inputs               */
/* -------------------- */

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="w-full border rounded-md px-3 py-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div className="col-span-2">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        rows={3}
        className="w-full border rounded-md px-3 py-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

function Select({
  label,
  value,
  options = [],
  onChange,
}: {
  label: string
  value: string
  options?: { id: number; name: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>

      <select
        className="w-full border rounded-md px-3 py-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Selecione</option>

        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  )
}

