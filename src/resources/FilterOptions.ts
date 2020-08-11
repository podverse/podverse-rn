import Config from 'react-native-config'
import { translate } from '../lib/i18n'
import { Filters } from './Filters'

const {
  _subscribedKey,
  _downloadedKey,
  _allPodcastsKey,
  _categoryKey,
  _alphabeticalKey,
  _mostRecentKey,
  _randomKey,
  _topPastDay,
  _topPastWeek,
  _topPastMonth,
  _topPastYear,
  _chronologicalKey,
  _oldestKey,
  _myClipsKey,
  _allEpisodesKey,
  _podcastsKey,
  _episodesKey,
  _clipsKey,
  _playlistsKey,
  _aboutPodcastKey,
  _showNotesKey,
  _titleKey,
  _myPlaylistsKey,
  _fromThisPodcastKey,
  _fromThisEpisodeKey,
  _allCategoriesKey
} = Filters

const _top = [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear]

const sortAlphabeticalItem = {
  i18nKey: 'alphabetical',
  value: _alphabeticalKey
}

const sortChronologicalItem = {
  i18nKey: 'chronological',
  value: _chronologicalKey
}

const allFilterTypeItems = [
  {
    i18nKey: 'Subscribed',
    value: _subscribedKey
  },
  {
    i18nKey: 'Downloaded',
    value: _downloadedKey
  },
  {
    i18nKey: 'All Podcasts',
    value: _allPodcastsKey
  },
  {
    i18nKey: 'Category',
    value: _categoryKey
  },
  {
    i18nKey: 'My Clips',
    value: _myClipsKey
  },
  {
    i18nKey: 'All Episodes',
    value: _allEpisodesKey
  },
  {
    i18nKey: 'Podcasts',
    value: _podcastsKey
  },
  {
    i18nKey: 'Episodes',
    value: _episodesKey
  },
  {
    i18nKey: 'Clips',
    value: _clipsKey
  },
  {
    i18nKey: 'Playlists',
    value: _playlistsKey
  },
  {
    i18nKey: 'About',
    value: _aboutPodcastKey
  },
  {
    i18nKey: 'Show Notes',
    value: _showNotesKey
  },
  {
    i18nKey: 'Title',
    value: _titleKey
  },
  {
    i18nKey: 'My Playlists',
    value: _myPlaylistsKey
  }
]

const filterTypeItemsList = Config.FILTER_TYPE_ITEMS ? Config.FILTER_TYPE_ITEMS.split(',') : []

const typeItems = [] as any[]
filterTypeItemsList.forEach((value: string) => {
  typeItems.push(allFilterTypeItems.find((x: any) => x.value === value))
})

const allSortItems = [
  sortChronologicalItem,
  sortAlphabeticalItem,
  {
    i18nKey: 'most recent',
    value: _mostRecentKey
  },
  {
    i18nKey: 'oldest',
    value: _oldestKey
  },
  {
    i18nKey: 'top - past day',
    value: _topPastDay
  },
  {
    i18nKey: 'top - past week',
    value: _topPastWeek
  },
  {
    i18nKey: 'top - past month',
    value: _topPastMonth
  },
  {
    i18nKey: 'top - past year',
    value: _topPastYear
  },
  {
    i18nKey: 'random',
    value: _randomKey
  }
]

const filterSortItemsList = Config.FILTER_SORT_ITEMS ? Config.FILTER_SORT_ITEMS.split(',') : []

const sortItems = [] as any[]
filterSortItemsList.forEach((value: string) => {
  sortItems.push(allSortItems.find((x: any) => x.value === value))
})

const allFromListItems = [
  {
    i18nKey: 'From this podcast',
    value: _fromThisPodcastKey
  },
  {
    i18nKey: 'From this episode',
    value: _fromThisEpisodeKey
  }
]

const filterFromListItemsList = Config.FILTER_FROM_ITEMS ? Config.FILTER_FROM_ITEMS.split(',') : []

const fromItems = [] as any[]
filterFromListItemsList.forEach((value: string) => {
  fromItems.push(allFromListItems.find((x: any) => x.value === value))
})

export const FilterOptions = {
  typeItems,
  sortItems,
  screenFilters: {
    ClipsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey, _myClipsKey],
      sort: [_mostRecentKey, ..._top],
      sublist: [{ i18nKey: 'All', value: _allCategoriesKey }],
      hideSort: []
    },
    EpisodeScreen: {
      type: [_clipsKey, _showNotesKey, _titleKey],
      sort: [_chronologicalKey, _mostRecentKey, ..._top, _randomKey],
      sublist: [],
      hideSort: [_showNotesKey, _titleKey]
    },
    EpisodesScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top],
      sublist: [{ i18nKey: 'All', value: _allCategoriesKey }],
      hideSort: [_downloadedKey]
    },
    PlayerScreen: {
      type: [_episodesKey, _clipsKey, _showNotesKey, _titleKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      sublist: fromItems,
      hideSort: [_showNotesKey, _titleKey]
    },
    PlaylistsScreen: {
      type: [_myPlaylistsKey, _subscribedKey],
      sort: [],
      sublist: [],
      hideSort: []
    },
    PodcastScreen: {
      type: [_episodesKey, _clipsKey, _aboutPodcastKey],
      sort: [_mostRecentKey, ..._top, _randomKey],
      sublist: [],
      hideSort: [_aboutPodcastKey]
    },
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [..._top],
      sublist: [{ i18nKey: 'All', value: _allCategoriesKey }],
      hideSort: [_subscribedKey, _downloadedKey]
    },
    ProfileScreen: {
      type: [_podcastsKey, _clipsKey, _playlistsKey],
      sort: [_mostRecentKey, ..._top],
      sublist: [],
      hideSort: [_playlistsKey],
      includeAlphabetical: [_podcastsKey]
    }
  },
  items: {
    sortAlphabeticalItem,
    sortChronologicalItem
  }
}
