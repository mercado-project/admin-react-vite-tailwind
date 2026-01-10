import axios from 'axios'


export type Category = {
  id: number
  name: string
  description?: string
  level: number
  parent?: { id: number } | null
  active: boolean
  showInMenu: boolean
  url: string
  meta_title?: string
  meta_description?: string
  image_url?: string
}

const api = axios.create({
  baseURL: 'http://localhost:3002',
})

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories')
  return data
}

export async function createCategory(payload: Omit<Category, 'id'>) {
  const { data } = await api.post('/categories', payload)
  return data
}

export async function updateCategory(
  id: number,
  payload: Partial<Category>
) {
  const { data } = await api.patch(`/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`)
}

export async function getMenuCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories/menu')
  return data
}

export async function updateCategoryMenu(
  id: number,
  showInMenu: boolean
) {
  const { data } = await api.patch(`/categories/${id}`, {
    showInMenu,
  })
  return data
}
