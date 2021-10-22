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
  _myPlaylistsKey,
  _fromThisPodcastKey,
  _fromThisEpisodeKey
} = Filters

const _top = [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear, _topAllTime]

const sortAlphabeticalItem = {
  label: translate('A-Z'),
  value: _alphabeticalKey
}

const sortChronologicalItem = {
  label: translate('start time'),
  value: _chronologicalKey
}

const allFilterTypeItems = [
  {
    label: translate('Subscribed'),
    value: _subscribedKey
  },
  {
    label: translate('Downloaded'),
    value: _downloadedKey
  },
  {
    label: translate('All Podcasts'),
    value: _allPodcastsKey
  },
  {
    label: translate('Category'),
    value: _categoryKey
  },
  {
    label: translate('My Clips'),
    value: _myClipsKey
  },
  {
    label: translate('All Episodes'),
    value: _allEpisodesKey
  },
  {
    label: translate('Podcasts'),
    value: _podcastsKey
  },
  {
    label: translate('Episodes'),
    value: _episodesKey
  },
  {
    label: translate('Chapters'),
    value: _chaptersKey
  },
  {
    label: translate('Clips'),
    value: _clipsKey
  },
  {
    label: translate('Playlists'),
    value: _playlistsKey
  },
  {
    label: translate('My Playlists'),
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
    label: translate('recent'),
    value: _mostRecentKey
  },
  {
    label: translate('oldest'),
    value: _oldestKey
  },
  {
    label: translate('top - day'),
    value: _topPastDay
  },
  {
    label: translate('top - week'),
    value: _topPastWeek
  },
  {
    label: translate('top - month'),
    value: _topPastMonth
  },
  {
    label: translate('top - year'),
    value: _topPastYear
  },
  {
    label: translate('top - all time'),
    value: _topAllTime
  },
  {
    label: translate('random'),
    value: _randomKey
  }
]

const filterSortItemsList = Config.FILTER_SORT_ITEMS ? Config.FILTER_SORT_ITEMS.split(',') : []

const sortItems = allSortItems.filter((item: any) => {
  console.log('---', { allSortItems, filterSortItemsList });
  return filterSortItemsList.find((value: string) => item.value === value)
})

const allFromListItems = [
  {
    label: translate('Podcast Clips'),
    labelShort: translate('Podcast'),
    value: _fromThisPodcastKey
  },
  {
    label: translate('Episode Clips'),
    labelShort: translate('Episode'),
    value: _fromThisEpisodeKey
  }
]

const filterFromListItemsList = Config.FILTER_FROM_ITEMS ? Config.FILTER_FROM_ITEMS.split(',') : []

const fromItems = allFromListItems.filter((item: any) => {
  return filterFromListItemsList.find((value: string) => item.value === value)
})

export const FilterOptions = {
  fromItems,
  typeItems,
  sortItems,
  screenFilters: {
    ClipsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top]
    },
    EpisodeMediaRefScreen: {
      from: [_fromThisEpisodeKey],
      sort: [_chronologicalKey, _mostRecentKey, ..._top, _randomKey]
    },
    EpisodesScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top, _randomKey],
      sortLimitQueries: [..._top]
    },
    PlayerScreen: {
      clipsFrom: [_fromThisEpisodeKey, _fromThisPodcastKey],
      clipsFromEpisodeSort: [_chronologicalKey, _mostRecentKey, ..._top],
      clipsFromPodcastSort: [_mostRecentKey, ..._top]
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
      sortClips: [_mostRecentKey, ..._top],
      sortPlaylists: [_alphabeticalKey],
      sortPodcasts: [_alphabeticalKey, _mostRecentKey, ..._top]
    }
  },
  items: {
    sortAlphabeticalItem,
    sortChronologicalItem
  }
}
