import axios from 'axios'

const API_URL = 'http://localhost:3002'

/* ===================== */
/* TYPES                 */
/* ===================== */

export type Price = {
  id: number
  productId: number
  product?: { id: number }
  price: number
  createdAt: string
}

export type Stock = {
  id: number
  productId: number
  product?: { id: number }
  quantity: number
  updatedAt: string
}

export type InventoryProduct = {
  id: number
  name: string
  sku: string
  currentPrice?: Price
  currentStock?: Stock
}

/* ===================== */
/* PRICES                */
/* ===================== */

export async function getAllPrices(): Promise<Price[]> {
  const { data } = await axios.get(`${API_URL}/prices`)
  if (!Array.isArray(data)) return []
  // Normaliza productId do objeto product
  return data.map((price: any) => ({
    ...price,
    productId: price.productId || price.product?.id,
  }))
}

export async function getPriceById(id: number): Promise<Price> {
  const { data } = await axios.get(`${API_URL}/prices/${id}`)
  return data
}

export function createPrice(payload: { productId: number; price: number }) {
  return axios.post(`${API_URL}/prices`, payload)
}

export function updatePrice(id: number, payload: { price: number }) {
  return axios.patch(`${API_URL}/prices/${id}`, payload)
}

export function deletePrice(id: number) {
  return axios.delete(`${API_URL}/prices/${id}`)
}

/* ===================== */
/* STOCK                 */
/* ===================== */

export async function getAllStocks(): Promise<Stock[]> {
  const { data } = await axios.get(`${API_URL}/stock`)
  if (!Array.isArray(data)) return []
  // Normaliza productId do objeto product
  return data.map((stock: any) => ({
    ...stock,
    productId: stock.productId || stock.product?.id,
  }))
}

export async function getStockById(id: number): Promise<Stock> {
  const { data } = await axios.get(`${API_URL}/stock/${id}`)
  return data
}

export function createStock(payload: { productId: number; quantity: number }) {
  return axios.post(`${API_URL}/stock`, payload)
}

export function updateStock(id: number, payload: { quantity: number }) {
  return axios.patch(`${API_URL}/stock/${id}`, payload)
}

export function deleteStock(id: number) {
  return axios.delete(`${API_URL}/stock/${id}`)
}
