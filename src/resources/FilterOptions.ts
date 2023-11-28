import { getGlobal } from 'reactn'
import Config from 'react-native-config'
import { translate } from '../lib/i18n'
import { Filters } from './Filters'

const {
  _subscribedKey,
  _downloadedKey,
  _allPodcastsKey,
  _customFeedsKey,
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
  _tracksKey,
  _hideCompletedKey,
  _showCompletedKey,
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

const allFilterTypeItems = () => {
  return [
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
      label: translate('Custom Feeds'),
      value: _customFeedsKey
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
      label: translate('Music - Tracks'),
      value: _tracksKey
    },
    {
      label: translate('Hide Completed'),
      value: _hideCompletedKey
    },
    {
      label: translate('Show Completed'),
      value: _showCompletedKey
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
}

const filterTypeItemsList = Config.FILTER_TYPE_ITEMS ? Config.FILTER_TYPE_ITEMS.split(',') : []

const getTypeItems = () =>
  allFilterTypeItems().filter((item: any) => {
    const { hideCompleted } = getGlobal()
    return filterTypeItemsList.find((value: string) => {
      if (!hideCompleted && item.value === _showCompletedKey) return false
      if (hideCompleted && item.value === _hideCompletedKey) return false
      return item.value === value
    })
  })

const allSortItems = [
  sortChronologicalItem,
  sortAlphabeticalItem,
  {
    label: translate('Recent'),
    value: _mostRecentKey
  },
  {
    label: translate('oldest'),
    value: _oldestKey
  },
  {
    label: translate('top – day'),
    value: _topPastDay
  },
  {
    label: translate('top – week'),
    value: _topPastWeek
  },
  {
    label: translate('top – month'),
    value: _topPastMonth
  },
  {
    label: translate('top – year'),
    value: _topPastYear
  },
  {
    label: translate('top – all time'),
    value: _topAllTime
  },
  {
    label: translate('random'),
    value: _randomKey
  }
]

const filterSortItemsList = Config.FILTER_SORT_ITEMS ? Config.FILTER_SORT_ITEMS.split(',') : []

const sortItems = allSortItems.filter((item: any) => {
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
  getTypeItems,
  sortItems,
  screenFilters: {
    AlbumScreen: {
      type: [_downloadedKey, _tracksKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      addByPodcastRSSFeedURLType: [_downloadedKey, _tracksKey],
      addByPodcastRSSFeedURLSort: [_mostRecentKey, _oldestKey]
    },
    AlbumsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey, _customFeedsKey],
      sort: [..._top],
      subscribedSort: [_alphabeticalKey, _mostRecentKey]
    },
    ClipsScreen: {
      type: [_subscribedKey, _allPodcastsKey, _categoryKey],
      sort: [_mostRecentKey, ..._top]
    },
    EpisodeMediaRefScreen: {
      from: [_fromThisEpisodeKey],
      sort: [_chronologicalKey, _mostRecentKey, ..._top, _randomKey]
    },
    EpisodesScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _hideCompletedKey, _categoryKey],
      sort: [_mostRecentKey, _oldestKey, ..._top],
      sortLimitQueries: [..._top]
    },
    PlayerScreen: {
      clipsFrom: [_fromThisEpisodeKey, _fromThisPodcastKey],
      clipsFromEpisodeSort: [_chronologicalKey, _mostRecentKey, ..._top, _randomKey],
      clipsFromPodcastSort: [_mostRecentKey, ..._top]
    },
    PodcastScreen: {
      type: [_downloadedKey, _episodesKey, _hideCompletedKey, _showCompletedKey, _clipsKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      addByPodcastRSSFeedURLType: [_downloadedKey, _episodesKey],
      addByPodcastRSSFeedURLSort: [_mostRecentKey, _oldestKey],
      seasonsSort: [_mostRecentKey, _oldestKey]
    },
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey, _customFeedsKey],
      sort: [..._top],
      subscribedSort: [_alphabeticalKey, _mostRecentKey]
    },
    ProfileScreen: {
      type: [_podcastsKey, _clipsKey, _playlistsKey],
      sortClips: [_mostRecentKey, ..._top, _randomKey],
      sortPlaylists: [_alphabeticalKey],
      sortPodcasts: [_alphabeticalKey, _mostRecentKey, ..._top, _randomKey]
    }
  },
  items: {
    sortAlphabeticalItem,
    sortChronologicalItem
  }
}
