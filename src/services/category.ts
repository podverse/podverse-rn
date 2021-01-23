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

const generateFlatCategoryItems = (allCategories: any[]) => {
  const flatCategoryItems = []
  for (const categoryItem of allCategories) {
    flatCategoryItems.push(categoryItem)
    const subCategoryItems = categoryItem.categories
    for (const subCategoryItem of subCategoryItems) {
      subCategoryItem.parentId = categoryItem.id
      flatCategoryItems.push(subCategoryItem)
    }
  }
  return flatCategoryItems
}

const getCategoryItems = async () => {
  let categoryItems = []
  try {
    const categoryItemsString = await AsyncStorage.getItem('CATEGORIES_LIST')
    if (categoryItemsString) {
      categoryItems = JSON.parse(categoryItemsString).map((category: any) => {
        return {
          label: category.title,
          value: category.id,
          ...category
        }
      })
    }
    return categoryItems
  } catch (err) {
    console.log('Bottom Selection Bar error: ', err)
  }
}

export const getFlatCategoryItems = async () => {
  const categoryItems = await getCategoryItems()
  return generateFlatCategoryItems(categoryItems)
}

export const getDefaultCategory = async () => {
  const flatCategoryItems = await getFlatCategoryItems()
  const defaultItem = flatCategoryItems[0]
  return defaultItem || {}
}
