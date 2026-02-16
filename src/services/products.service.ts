import axios from 'axios'

export type Product = {
  id: number
  name: string
  sku: string
  description: string
  meta_description: string
  meta_title: string
  active: boolean
  url: string
  brand?: string
  images?: {
    id: number
    image_url: string
    is_main: boolean
  }[]
  category?: { id: number; name: string }
  prices?: { price: string }[]
  stocks?: { quantity: number }[]
}

const api = axios.create({
  baseURL: 'http://localhost:3002',
})

export async function getAllProducts(): Promise<Product[]> {
  const { data } = await api.get('/products')
  return data
}

export async function updateProduct(id: number, payload: any) {
  return api.patch(`/products/${id}`, payload)
}

export async function deleteProduct(id: number) {
  return api.delete(`/products/${id}`)
}

export async function createProduct(payload: any) {
  const { data } = await api.post('/products', payload)
  return data
}

export async function createProductImage(payload: {
  productId: number
  image_url: string
  is_main: boolean
}) {
  return api.post('/products/images', payload)
}

export async function createProductPrice(payload: {
  productId: number
  price: number
}) {
  return api.post('/prices', payload)
}

export async function searchProducts(query: string): Promise<Product[]> {
  // Backend supports /products/search?w=...
  const { data } = await api.get('/products/search', {
    params: { w: query },
  })
  return Array.isArray(data) ? data : []
}
