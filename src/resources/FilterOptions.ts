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
  _aboutKey,
  _showNotesKey,
  _titleKey,
  _myPlaylistsKey,
  _fromThisPodcastKey,
  _fromThisEpisodeKey,
  _allCategoriesKey
} = Filters

const _top = [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear]

const sortAlphabeticalItem = {
  label: 'alphabetical',
  value: _alphabeticalKey
}

const sortChronologicalItem = {
  label: 'chronological',
  value: _chronologicalKey
}

export const FilterOptions = {
  typeItems: [
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
      label: 'Clips',
      value: _clipsKey
    },
    {
      label: 'Playlists',
      value: _playlistsKey
    },
    {
      label: 'About',
      value: _aboutKey
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
  ],
  sortItems: [
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
      label: 'random',
      value: _randomKey
    }
  ],
  fromListItems: [
    {
      label: 'All',
      value: _allCategoriesKey
    },
    {
      label: 'From this podcast',
      value: _fromThisPodcastKey
    },
    {
      label: 'From this episode',
      value: _fromThisEpisodeKey
    }
  ],
  screenFilters: {
    ClipsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey, _myClipsKey],
      sort: [_mostRecentKey, ..._top],
      sublist: [{ label: 'All', value: _allCategoriesKey }],
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
      sublist: [{ label: 'All', value: _allCategoriesKey }],
      hideSort: [_downloadedKey]
    },
    PlayerScreen: {
      type: [_episodesKey, _clipsKey, _showNotesKey, _titleKey],
      sort: [_mostRecentKey, _oldestKey, ..._top, _randomKey],
      sublist: [
        {
          label: 'From this podcast',
          value: _fromThisPodcastKey
        },
        {
          label: 'From this episode',
          value: _fromThisEpisodeKey
        }
      ],
      hideSort: [_showNotesKey, _titleKey]
    },
    PlaylistsScreen: {
      type: [_myPlaylistsKey, _subscribedKey],
      sort: [],
      sublist: [],
      hideSort: []
    },
    PodcastScreen: {
      type: [_episodesKey, _clipsKey, _aboutKey],
      sort: [_mostRecentKey, ..._top, _randomKey],
      sublist: [],
      hideSort: [_aboutKey]
    },
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [..._top],
      sublist: [{ label: 'All', value: _allCategoriesKey }],
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
