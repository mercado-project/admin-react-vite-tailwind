import axios from 'axios'

const API_URL = 'http://localhost:3002'

/* ===================== */
/* TYPES                 */
/* ===================== */

export type Customer = {
  id: number
  fullName: string
  cpf: string
  birthDate?: string
  phone: string
  user?: {
    id: number
    email: string
    role: string
  }
  createdAt: string
}

/* ===================== */
/* FUNCTIONS             */
/* ===================== */

export async function getAllCustomers(): Promise<Customer[]> {
  const response = await axios.get(`${API_URL}/customers`)
  const { data } = response.data
  return Array.isArray(data) ? data : []
}

export async function getCustomerById(id: number): Promise<Customer> {
  const { data } = await axios.get(`${API_URL}/customers/${id}`)
  return data
}

export function createCustomer(payload: {
  fullName: string
  cpf: string
  birthDate?: string
  phone: string
  email?: string
  password?: string
}) {
  return axios.post(`${API_URL}/customers`, payload)
}

export function updateCustomer(
  id: number,
  payload: {
    fullName?: string
    cpf?: string
    birthDate?: string
    phone?: string
  }
) {
  return axios.patch(`${API_URL}/customers/${id}`, payload)
}

export function deleteCustomer(id: number) {
  return axios.delete(`${API_URL}/customers/${id}`)
}
