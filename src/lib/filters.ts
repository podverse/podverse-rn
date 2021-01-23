import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getFlatCategoryItems } from '../services/category'

export const sectionsWithCategory = (filterItems: any[], flatCategoryItems: any[], sortItems: string[]) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Category'), data: flatCategoryItems, value: PV.Filters._sectionCategoryKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

export const sectionsWithoutCategory = (filterItems: any, sortItems: any) => [
  { title: translate('Filter'), data: filterItems, value: PV.Filters._sectionFilterKey },
  { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
]

export const getDefaultSortForFilter = (options: any) => {
  const { screenName, selectedFilterItemKey, selectedSortItemKey } = options
  let newSelectedSortItemKey = selectedSortItemKey
  switch (screenName) {
    case PV.RouteNames.PodcastsScreen:
      if (selectedFilterItemKey === PV.Filters._downloadedKey || selectedFilterItemKey === PV.Filters._subscribedKey) {
        newSelectedSortItemKey = PV.Filters._alphabeticalKey
      } else {
        newSelectedSortItemKey = !PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(newSelectedSortItemKey)
          ? PV.Filters._topPastWeek
          : newSelectedSortItemKey
      }
      break
    default:
      break
  }

  return newSelectedSortItemKey
}

export const generateSections = (options: any) => {
  let sortItems: any[] = PV.FilterOptions.sortItems
  const {
    flatCategoryItems,
    screenName,
    selectedCategoryItemKey,
    selectedCategorySubItemKey,
    selectedFilterItemKey,
    selectedSortItemKey
  } = options
  let filterItems: any[] = []
  let newSelectedCategoryItemKey = selectedCategoryItemKey
  let newSelectedCategorySubItemKey = selectedCategorySubItemKey
  const newSelectedFilterItemKey = selectedFilterItemKey
  let newSelectedSortItemKey = selectedSortItemKey

  switch (screenName) {
    case PV.RouteNames.PodcastsScreen:
      newSelectedSortItemKey = getDefaultSortForFilter(options)
      if (selectedFilterItemKey === PV.Filters._downloadedKey || selectedFilterItemKey === PV.Filters._subscribedKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter((item) => item.value === PV.Filters._alphabeticalKey)
      } else {
        if (selectedFilterItemKey === PV.Filters._allPodcastsKey) {
          newSelectedCategoryItemKey = ''
          newSelectedCategorySubItemKey = ''
        }
        sortItems = sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(item.value)
        )
      }

      filterItems = PV.FilterOptions.typeItems.filter((item) =>
        PV.FilterOptions.screenFilters.PodcastsScreen.type.includes(item.value)
      )

      break
    default:
      break
  }

  /* If the key does not match any filter type, assume it is a category id. */
  const includeCategories =
    selectedFilterItemKey === PV.Filters._categoryKey ||
    !PV.FilterOptions.screenFilters[screenName].type.includes(selectedFilterItemKey)

  const sections = includeCategories
    ? sectionsWithCategory(filterItems, flatCategoryItems, sortItems)
    : sectionsWithoutCategory(filterItems, sortItems)

  return {
    newSelectedCategoryItemKey,
    newSelectedCategorySubItemKey,
    newSelectedFilterItemKey,
    newSelectedSortItemKey,
    sections
  }
}

export const getSelectedFilterLabel = async (
  selectedFilterItemKey?: string | null,
  selectedCategoryItemKey?: string | null,
  selectedCategorySubItemKey?: string | null
) => {
  let selectedFilterItem
  if (!selectedCategoryItemKey && !selectedCategorySubItemKey) {
    selectedFilterItem = PV.FilterOptions.typeItems.find((item) => {
      return item.value === selectedFilterItemKey
    })
  } else if (selectedCategorySubItemKey) {
    const flatCategoryItems = await getFlatCategoryItems()
    selectedFilterItem = flatCategoryItems.find(
      (item) => item.value === selectedCategorySubItemKey || item.id === selectedCategorySubItemKey
    )
  } else if (selectedCategoryItemKey) {
    const flatCategoryItems = await getFlatCategoryItems()
    selectedFilterItem = flatCategoryItems.find(
      (item) => item.value === selectedCategoryItemKey || item.id === selectedCategoryItemKey
    )
  }
  const selectedFilterLabel = selectedFilterItem && (selectedFilterItem.label || selectedFilterItem.title)

  return selectedFilterLabel || ''
}
