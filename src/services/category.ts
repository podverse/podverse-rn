import { request } from './request'

export const getTopLevelCategories = async () => {
  const response = await request({
    endpoint: '/category',
    query: { topLevelCategories: true }
  })
  return response && response.data
}

export const getCategoryById = async (id: string) => {
  const response = await request({
    endpoint: `/category/${id}`
  })
  return response && response.data
}
