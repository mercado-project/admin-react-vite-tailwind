import axios from 'axios'

const API_URL = 'http://localhost:3002/orders'

/* ===================== */
/* TYPES                 */
/* ===================== */

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled'
export type PaymentMethod = 'card' | 'pix' | 'boleto'

export type Customer = {
  id: number
  fullName: string
  email?: string
  phone?: string
}

export type Address = {
  id: number
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export type Product = {
  id: number
  name: string
  sku?: string
}

export type OrderItem = {
  id: number
  product: Product
  quantity: number
  unitPrice: number
}

export type Order = {
  id: number
  customer: Customer
  address?: Address
  orderDate: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  shippingFee: number
  items: OrderItem[]
}

export type OrdersResponse = {
  data: Order[]
  total: number
}

export type OrdersQueryParams = {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  startDate?: string
  endDate?: string
}

/* ===================== */
/* ORDERS                */
/* ===================== */

export async function getOrders(params?: OrdersQueryParams): Promise<OrdersResponse> {
  const { data } = await axios.get(API_URL, { params })
  return data
}

export async function getOrderById(id: number): Promise<Order> {
  const { data } = await axios.get(`${API_URL}/${id}`)
  return data
}

export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  const { data } = await axios.get(`${API_URL}/customer/${customerId}`)
  return Array.isArray(data) ? data : []
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return axios.patch(`${API_URL}/${id}`, { status })
}

export function deleteOrder(id: number) {
  return axios.delete(`${API_URL}/${id}`)
}

export type OrderStats = {
  today: {
    count: number
    total: number
  }
  month: {
    count: number
    total: number
  }
}

export async function getOrderStats(): Promise<OrderStats> {
  const { data } = await axios.get(`${API_URL}/stats`)
  return data
}
