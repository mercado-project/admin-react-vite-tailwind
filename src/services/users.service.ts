import axios from 'axios'

const API_URL = 'http://localhost:3002'

/* ===================== */
/* TYPES                 */
/* ===================== */

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export type User = {
  id: number
  email: string
  role: UserRole
  customer?: {
    id: number
    fullName: string
    cpf: string
    phone: string
  }
  createdAt: string
}

/* ===================== */
/* FUNCTIONS             */
/* ===================== */

export async function getAllUsers(): Promise<User[]> {
  const { data } = await axios.get(`${API_URL}/users`)
  return Array.isArray(data) ? data : []
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await axios.get(`${API_URL}/users/${id}`)
  return data
}

export function createUser(payload: {
  email: string
  password: string
  role?: UserRole
  customerId?: number
}) {
  return axios.post(`${API_URL}/users`, payload)
}

export function updateUser(
  id: number,
  payload: {
    email?: string
    password?: string
    role?: UserRole
  }
) {
  return axios.patch(`${API_URL}/users/${id}`, payload)
}

export function deleteUser(id: number) {
  return axios.delete(`${API_URL}/users/${id}`)
}
