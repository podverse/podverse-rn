import { request } from './request'

export const getTopLevelCategories = async () => {
  const response = await request({
    endpoint: '/category',
    query: { topLevelCategories: true }
  })
  return response.json()
}

export const getCategoryById = async (id: string) => {
  const response = await request({
    endpoint: `/category/${id}`
  })
  return response.json()
}
