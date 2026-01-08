import axios from 'axios'

export type Category = {
  id: number
  name: string
  parent?: {
    id: number
  } | null
  level: number
}

const API_URL = 'http://localhost:3002/categories'

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await axios.get(API_URL)
  return data
}
