import axios from 'axios'

const API_URL = 'http://localhost:3002/cms'

/* ===================== */
/* TYPES                 */
/* ===================== */

export type CmsPage = {
  id: number
  title: string
  url: string
  content: string
  pageType: string
  metaTitle: string
  metaDescription: string
  bannerImage: string | null
  active: boolean
  createdAt: string
}

export type Banner = {
  id: number
  imageUrl: string
  linkUrl: string
  active: boolean
  createdAt: string
}

/* ===================== */
/* CMS PAGES             */
/* ===================== */

export async function getAllCmsPages(): Promise<CmsPage[]> {
  const { data } = await axios.get(API_URL)
  return Array.isArray(data) ? data : []
}

export function createCmsPage(payload: Partial<CmsPage>) {
  return axios.post(API_URL, payload)
}

export function updateCmsPage(id: number, payload: Partial<CmsPage>) {
  return axios.patch(`${API_URL}/${id}`, payload)
}

export function deleteCmsPage(id: number) {
  return axios.delete(`${API_URL}/${id}`)
}

/* ===================== */
/* BANNERS               */
/* ===================== */

export async function getAllBanners(): Promise<Banner[]> {
  const { data } = await axios.get(`${API_URL}/banners`)
  return Array.isArray(data) ? data : []
}

export function createBanner(payload: Partial<Banner>) {
  return axios.post(`${API_URL}/banners`, payload)
}

export function updateBanner(id: number, payload: Partial<Banner>) {
  return axios.patch(`${API_URL}/banners/${id}`, payload)
}

export function deleteBanner(id: number) {
  return axios.delete(`${API_URL}/banners/${id}`)
}
