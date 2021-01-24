import Config from 'react-native-config'
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
  _topAllTime,
  _chronologicalKey,
  _oldestKey,
  _myClipsKey,
  _allEpisodesKey,
  _podcastsKey,
  _episodesKey,
  _clipsKey,
  _chaptersKey,
  _playlistsKey,
  _aboutPodcastKey,
  _showNotesKey,
  _titleKey,
  _myPlaylistsKey,
  _fromThisPodcastKey,
  _fromThisEpisodeKey
} = Filters

const _top = [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear, _topAllTime]

const sortAlphabeticalItem = {
  label: 'alphabetical',
  value: _alphabeticalKey
}

const sortChronologicalItem = {
  label: 'chronological',
  value: _chronologicalKey
}

const allFilterTypeItems = [
  {
    label: 'Subscribed',
    value: _subscribedKey
  },
  {
    label: 'Downloaded',
    value: _downloadedKey
  },
  {
    label: 'All Podcasts',
    value: _allPodcastsKey
  },
  {
    label: 'Category',
    value: _categoryKey
  },
  {
    label: 'My Clips',
    value: _myClipsKey
  },
  {
    label: 'All Episodes',
    value: _allEpisodesKey
  },
  {
    label: 'Podcasts',
    value: _podcastsKey
  },
  {
    label: 'Episodes',
    value: _episodesKey
  },
  {
    label: 'Chapters',
    value: _chaptersKey
  },
  {
    label: 'Clips',
    value: _clipsKey
  },
  {
    label: 'Playlists',
    value: _playlistsKey
  },
  {
    label: 'About',
    value: _aboutPodcastKey
  },
  {
    label: 'Show Notes',
    value: _showNotesKey
  },
  {
    label: 'Title',
    value: _titleKey
  },
  {
    label: 'My Playlists',
    value: _myPlaylistsKey
  }
]

const filterTypeItemsList = Config.FILTER_TYPE_ITEMS ? Config.FILTER_TYPE_ITEMS.split(',') : []

const typeItems = allFilterTypeItems.filter((item: any) => {
  return filterTypeItemsList.find((value: string) => item.value === value)
})

const allSortItems = [
  sortChronologicalItem,
  sortAlphabeticalItem,
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'oldest',
    value: _oldestKey
  },
  {
    label: 'top - past day',
    value: _topPastDay
  },
  {
    label: 'top - past week',
    value: _topPastWeek
  },
  {
    label: 'top - past month',
    value: _topPastMonth
  },
  {
    label: 'top - past year',
    value: _topPastYear
  },
  {
    label: 'top - all time',
    value: _topAllTime
  },
  {
    label: 'random',
    value: _randomKey
  }
]

const filterSortItemsList = Config.FILTER_SORT_ITEMS ? Config.FILTER_SORT_ITEMS.split(',') : []

const sortItems = allSortItems.filter((item: any) => {
  return filterSortItemsList.find((value: string) => item.value === value)
})

const allFromListItems = [
  {
    label: 'From this podcast',
    value: _fromThisPodcastKey
  },
  {
    label: 'From this episode',
    value: _fromThisEpisodeKey
  }
]

const filterFromListItemsList = Config.FILTER_FROM_ITEMS ? Config.FILTER_FROM_ITEMS.split(',') : []

const fromItems = allFromListItems.filter((item: any) => {
  return filterFromListItemsList.find((value: string) => item.value === value)
})

export const FilterOptions = {
  typeItems,
  sortItems,
  screenFilters: {
    ClipsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top],
      hideSort: []
    },
    EpisodeScreen: {
      type: [_chaptersKey, _clipsKey, _showNotesKey, _titleKey],
      addByPodcastRSSFeedURLType: [_showNotesKey, _titleKey],
      sort: [_chronologicalKey, _mostRecentKey, ..._top, _randomKey],
      hideSort: [_chaptersKey, _showNotesKey, _titleKey],
      includeChronological: true
    },
    EpisodesScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top],
      sortLimitQueries: [..._top]
    },
    PlayerScreen: {
      type: [_chaptersKey, _clipsKey, _showNotesKey, _titleKey],
      addByPodcastRSSFeedURLType: [_showNotesKey, _titleKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      hideSort: [_chaptersKey, _showNotesKey, _titleKey],
      fromItems,
      includeChronological: true
    },
    PlaylistsScreen: {
      type: [_myPlaylistsKey, _subscribedKey],
      sort: [],
      hideSort: []
    },
    PodcastScreen: {
      type: [_downloadedKey, _episodesKey, _clipsKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      addByPodcastRSSFeedURLType: [_downloadedKey, _episodesKey],
      addByPodcastRSSFeedURLSort: [_mostRecentKey]
    },
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [..._top]
    },
    ProfileScreen: {
      type: [_podcastsKey, _clipsKey, _playlistsKey],
      sort: [_mostRecentKey, ..._top],
      hideSort: [_playlistsKey],
      includeAlphabetical: [_podcastsKey]
    }
  },
  items: {
    sortAlphabeticalItem,
    sortChronologicalItem
  }
}
