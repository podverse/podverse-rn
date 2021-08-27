import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { getFlatCategoryItems } from '../services/category'

export const getDefaultSortForFilter = (options: any) => {
  const {
    addByRSSPodcastFeedUrl,
    screenName,
    selectedFilterItemKey,
    selectedFromItemKey,
    selectedSortItemKey
  } = options
  let newSelectedSortItemKey = selectedSortItemKey
  switch (screenName) {
    case PV.RouteNames.ClipsScreen:
      break
    case PV.RouteNames.EpisodesScreen:
      if (selectedFilterItemKey === PV.Filters._subscribedKey) {
        newSelectedSortItemKey = newSelectedSortItemKey
      } else if (selectedFilterItemKey === PV.Filters._downloadedKey) {
        newSelectedSortItemKey = PV.Filters._mostRecentKey
      } else if (selectedFilterItemKey === PV.Filters._allPodcastsKey) {
        newSelectedSortItemKey =
          newSelectedSortItemKey === PV.Filters._mostRecentKey ? PV.Filters._topPastWeek : newSelectedSortItemKey
      } else if (selectedFilterItemKey === PV.Filters._categoryKey) {
        newSelectedSortItemKey =
          newSelectedSortItemKey === PV.Filters._mostRecentKey ? PV.Filters._topPastWeek : newSelectedSortItemKey
      } else {
        newSelectedSortItemKey =
          newSelectedSortItemKey === PV.Filters._mostRecentKey ? PV.Filters._topPastWeek : newSelectedSortItemKey
      }
      break
    case PV.RouteNames.PlayerScreen:
      if (
        selectedFromItemKey === PV.Filters._fromThisPodcastKey &&
        selectedSortItemKey === PV.Filters._chronologicalKey
      ) {
        newSelectedSortItemKey = PV.Filters._topPastWeek
      }
      break
    case PV.RouteNames.PodcastScreen:
      if (addByRSSPodcastFeedUrl) {
        newSelectedSortItemKey = PV.Filters._mostRecentKey
      } else if (selectedFilterItemKey === PV.Filters._downloadedKey) {
        newSelectedSortItemKey = PV.Filters._mostRecentKey
      }
      break
    case PV.RouteNames.PodcastsScreen:
      if (selectedFilterItemKey === PV.Filters._downloadedKey || selectedFilterItemKey === PV.Filters._subscribedKey) {
        newSelectedSortItemKey = PV.Filters._alphabeticalKey
      } else {
        newSelectedSortItemKey = !PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(newSelectedSortItemKey)
          ? PV.Filters._topPastWeek
          : newSelectedSortItemKey
      }
      break
    case PV.RouteNames.ProfileScreen:
      if (selectedFilterItemKey === PV.Filters._podcastsKey) {
        newSelectedSortItemKey = !PV.FilterOptions.screenFilters.ProfileScreen.sortPodcasts.includes(
          newSelectedSortItemKey
        )
          ? PV.Filters._alphabeticalKey
          : newSelectedSortItemKey
      } else if (selectedFilterItemKey === PV.Filters._clipsKey) {
        newSelectedSortItemKey = !PV.FilterOptions.screenFilters.ProfileScreen.sortClips.includes(
          newSelectedSortItemKey
        )
          ? PV.Filters._mostRecentKey
          : newSelectedSortItemKey
      } else if (selectedFilterItemKey === PV.Filters._playlistsKey) {
        newSelectedSortItemKey = PV.Filters._alphabeticalKey
      }
      break
    default:
      break
  }

  return newSelectedSortItemKey
}

const filterAccessibilityHint = 'ARIA HINT - Select a primary filter from the list below'
const categoryAccessibilityHint = 'ARIA HINT - Select a category from the list below'
const sortingFilterAccessibilityHint = 'ARIA HINT - Select a sorting filter from the list below'

export const generateSections = (options: any) => {
  let sortItems: any[] = PV.FilterOptions.sortItems
  const {
    addByRSSPodcastFeedUrl,
    flatCategoryItems,
    screenName,
    selectedCategoryItemKey,
    selectedCategorySubItemKey,
    selectedFilterItemKey,
    selectedFromItemKey
  } = options

  let filterItems: any[] = []
  let fromItems: any[] = []
  let sections: any[] = []
  let newSelectedCategoryItemKey = selectedCategoryItemKey
  let newSelectedCategorySubItemKey = selectedCategorySubItemKey
  const newSelectedFilterItemKey = selectedFilterItemKey
  const newSelectedSortItemKey = getDefaultSortForFilter(options)
  const newSelectedFromItemKey = selectedFromItemKey

  /* If the key does not match any filter type, assume it is a category id. */
  const includeCategories =
    selectedFilterItemKey === PV.Filters._categoryKey ||
    (PV.FilterOptions.screenFilters[screenName].type &&
      !PV.FilterOptions.screenFilters[screenName].type.includes(selectedFilterItemKey))

  switch (screenName) {
    case PV.RouteNames.ClipsScreen:
      if (selectedFilterItemKey === PV.Filters._subscribedKey) {
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.ClipsScreen.sort.includes(item.value))
      } else if (selectedFilterItemKey === PV.Filters._downloadedKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.ClipsScreen.sort.includes(item.value))
      } else if (selectedFilterItemKey === PV.Filters._allPodcastsKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.ClipsScreen.sort.includes(item.value))
      } else if (selectedFilterItemKey === PV.Filters._categoryKey) {
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.ClipsScreen.sort.includes(item.value))
      }

      filterItems = PV.FilterOptions.typeItems.filter((item) =>
        PV.FilterOptions.screenFilters.ClipsScreen.type.includes(item.value)
      )

      sections = includeCategories
        ? [
            {
              title: translate('Filter'),
              data: filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Category'),
              data: flatCategoryItems,
              value: PV.Filters._sectionCategoryKey,
              accessibilityHint: translate(categoryAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]
        : [
            {
              title: translate('Filter'),
              data: filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]

      break
    case PV.RouteNames.EpisodeMediaRefScreen:
      fromItems = PV.FilterOptions.fromItems.filter((item) =>
        PV.FilterOptions.screenFilters.EpisodeMediaRefScreen.from.includes(item.value)
      )

      sortItems = sortItems.filter((item) =>
        PV.FilterOptions.screenFilters.EpisodeMediaRefScreen.sort.includes(item.value)
      )

      sections = [{ title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }]

      break
    case PV.RouteNames.EpisodesScreen:
      if (selectedFilterItemKey === PV.Filters._subscribedKey) {
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.EpisodesScreen.sort.includes(item.value))
      } else if (selectedFilterItemKey === PV.Filters._downloadedKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter((item) => item.value === PV.Filters._mostRecentKey)
      } else if (selectedFilterItemKey === PV.Filters._allPodcastsKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter(
          (item) =>
            PV.FilterOptions.screenFilters.EpisodesScreen.sort.includes(item.value) &&
            item.value !== PV.Filters._mostRecentKey
        )
      } else if (selectedFilterItemKey === PV.Filters._categoryKey) {
        sortItems = sortItems.filter(
          (item) =>
            PV.FilterOptions.screenFilters.EpisodesScreen.sort.includes(item.value) &&
            item.value !== PV.Filters._mostRecentKey
        )
      }

      filterItems = PV.FilterOptions.typeItems.filter((item) =>
        PV.FilterOptions.screenFilters.EpisodesScreen.type.includes(item.value)
      )

      sections = includeCategories
        ? [
            {
              title: translate('Filter'),
              data: filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Category'),
              data: flatCategoryItems,
              value: PV.Filters._sectionCategoryKey,
              accessibilityHint: translate(categoryAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]
        : [
            {
              title: translate('Filter'),
              data: filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]

      break
    case PV.RouteNames.PlayerScreen:
      fromItems = PV.FilterOptions.fromItems.filter((item) =>
        PV.FilterOptions.screenFilters.PlayerScreen.clipsFrom.includes(item.value)
      )

      if (selectedFromItemKey === PV.Filters._fromThisEpisodeKey) {
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.PlayerScreen.clipsFromEpisodeSort.includes(item.value)
        )
      } else if (selectedFromItemKey === PV.Filters._fromThisPodcastKey) {
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.PlayerScreen.clipsFromPodcastSort.includes(item.value)
        )
      }

      sections = [
        { title: translate('From'), data: fromItems, value: PV.Filters._sectionFromKey },
        { title: translate('Sort'), data: sortItems, value: PV.Filters._sectionSortKey }
      ]

      break
    case PV.RouteNames.PodcastScreen:
      if (addByRSSPodcastFeedUrl) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastScreen.addByPodcastRSSFeedURLType.includes(item.value)
        )
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastScreen.addByPodcastRSSFeedURLSort.includes(item.value)
        )
      } else if (selectedFilterItemKey === PV.Filters._downloadedKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) => item.value === PV.Filters._mostRecentKey)
      } else if (selectedFilterItemKey === PV.Filters._episodesKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.PodcastScreen.sort.includes(item.value))
      } else if (selectedFilterItemKey === PV.Filters._clipsKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.PodcastScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.PodcastScreen.sort.includes(item.value))
      }

      sections = [
        {
          title: translate('Filter'),
          data: filterItems,
          value: PV.Filters._sectionFilterKey,
          accessibilityHint: translate(filterAccessibilityHint),
          accessibilityRole: 'header'
        },
        {
          title: translate('Sort'),
          data: sortItems,
          value: PV.Filters._sectionSortKey,
          accessibilityHint: translate(sortingFilterAccessibilityHint),
          accessibilityRole: 'header'
        }
      ]

      break
    case PV.RouteNames.PodcastsScreen:
      if (selectedFilterItemKey === PV.Filters._downloadedKey || selectedFilterItemKey === PV.Filters._subscribedKey) {
        newSelectedCategoryItemKey = ''
        newSelectedCategorySubItemKey = ''
        sortItems = sortItems.filter((item) => item.value === PV.Filters._alphabeticalKey)
      } else {
        if (selectedFilterItemKey === PV.Filters._allPodcastsKey) {
          newSelectedCategoryItemKey = ''
          newSelectedCategorySubItemKey = ''
        }
        sortItems = sortItems.filter((item) => PV.FilterOptions.screenFilters.PodcastsScreen.sort.includes(item.value))
      }

      filterItems = PV.FilterOptions.typeItems.filter((item) =>
        PV.FilterOptions.screenFilters.PodcastsScreen.type.includes(item.value)
      )

      sections = includeCategories
        ? [
            {
              title: translate('Filter'),
              data:
              filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Category'),
              data: flatCategoryItems,
              value: PV.Filters._sectionCategoryKey,
              accessibilityHint: translate(categoryAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]
        : [
            {
              title: translate('Filter'),
              data: filterItems,
              value: PV.Filters._sectionFilterKey,
              accessibilityHint: translate(filterAccessibilityHint),
              accessibilityRole: 'header'
            },
            {
              title: translate('Sort'),
              data: sortItems,
              value: PV.Filters._sectionSortKey,
              accessibilityHint: translate(sortingFilterAccessibilityHint),
              accessibilityRole: 'header'
            }
          ]

      break
    case PV.RouteNames.ProfileScreen:
      if (selectedFilterItemKey === PV.Filters._podcastsKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.sortPodcasts.includes(item.value)
        )
      } else if (selectedFilterItemKey === PV.Filters._clipsKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.sortClips.includes(item.value)
        )
      } else if (selectedFilterItemKey === PV.Filters._playlistsKey) {
        filterItems = PV.FilterOptions.typeItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.type.includes(item.value)
        )
        sortItems = sortItems.filter((item) =>
          PV.FilterOptions.screenFilters.ProfileScreen.sortPlaylists.includes(item.value)
        )
      }

      sections = [
        {
          title: translate('Filter'),
          data: filterItems,
          value: PV.Filters._sectionFilterKey,
          accessibilityHint: translate(filterAccessibilityHint),
          accessibilityRole: 'header'
        },
        {
          title: translate('Sort'),
          data: sortItems,
          value: PV.Filters._sectionSortKey,
          accessibilityHint: translate(sortingFilterAccessibilityHint),
          accessibilityRole: 'header'
        }
      ]

      break
    default:
      break
  }

  return {
    newAddByRSSPodcastFeedUrl: addByRSSPodcastFeedUrl,
    newSelectedCategoryItemKey,
    newSelectedCategorySubItemKey,
    newSelectedFilterItemKey,
    newSelectedFromItemKey,
    newSelectedSortItemKey,
    sections
  }
}

export const getSelectedSortLabel = (selectedSortItemKey?: string | null) => {
  const selectedSortItem = PV.FilterOptions.sortItems.find((item) => item.value === selectedSortItemKey)
  const selectedSortLabel = selectedSortItem && selectedSortItem.label
  return selectedSortLabel || ''
}

export const getSelectedFromLabel = (selectedFromItemKey?: string | null) => {
  const selectedFilterItem = PV.FilterOptions.fromItems.find((item) => item.value === selectedFromItemKey)
  const selectedFilterLabel = selectedFilterItem && selectedFilterItem.label
  return selectedFilterLabel || ''
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
