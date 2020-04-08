import AsyncStorage from '@react-native-community/async-storage'
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

export const downloadCategoriesList = async () => {
  const categories = await getTopLevelCategories()
  try {
    if (!Array.isArray(categories[0])) {
      throw new Error('Categories response not an array')
    }
    await AsyncStorage.setItem('CATEGORIES_LIST', JSON.stringify(categories[0]))
  } catch (err) {
    console.log('Category download error: ', err)
  }
}
