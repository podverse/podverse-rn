import AsyncStorage from '@react-native-community/async-storage'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
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
    errorLogger('Category download error: ', err)
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
  } catch (error) {
    errorLogger('Bottom Selection Bar error: ', error)
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

export const getCategoryKey = (
  filterKey?: string | null,
  selectedCategory?: string | null,
  selectedCategorySub?: string | null
) => (filterKey = filterKey === PV.Filters._categoryKey ? selectedCategorySub || selectedCategory : filterKey)

export const getCategoryLabel = async (id: string) => {
  const flatCategoryItems = await getFlatCategoryItems()
  const item = flatCategoryItems.find((x: any) => id === x.value || id === x.id)
  return item && (item.label || item.title)
}

export const assignCategoryQueryToState = (
  filterKey: any,
  newState: any,
  queryOptions: any,
  selectedCategory: any,
  selectedCategorySub: any
) => {
  const newFilterKey = getCategoryKey(filterKey, selectedCategory, selectedCategorySub)
  const { isCategorySub } = queryOptions
  let categories

  if (filterKey === PV.Filters._categoryKey) {
    categories = selectedCategorySub ? selectedCategorySub : selectedCategory
    newState.selectedCategory = selectedCategory
    newState.selectedCategorySub = selectedCategorySub
  } else if (isCategorySub) {
    categories = filterKey
    newState.selectedCategorySub = filterKey
  } else {
    categories = filterKey
    newState.selectedCategorySub = ''
    newState.selectedCategory = filterKey
  }

  newState.queryFrom = PV.Filters._categoryKey

  return {
    categories,
    newFilterKey,
    newState
  }
}

export const assignCategoryToStateForSortSelect = (newState: any, selectedCategory: any, selectedCategorySub: any) => {
  if (selectedCategorySub) {
    newState.selectedCategorySub = selectedCategorySub
  } else if (selectedCategory) {
    newState.selectedCategory = selectedCategory
  }
  return newState
}
