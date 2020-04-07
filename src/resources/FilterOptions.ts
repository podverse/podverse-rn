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
  _playlistKey,
  _aboutKey,
  _showNotesKey,
  _titleKey,
  _myPlaylistsKey,
  _fromThisPodcastKey,
  _fromThisEpisodeKey,
  _allCategories
} = Filters

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
      value: _playlistKey
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
    {
      label: 'chronological',
      value: _chronologicalKey
    },
    {
      label: 'alphabetical',
      value: _alphabeticalKey
    },
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
      value: _allCategories
    },
    {
      label: 'From This Podcast',
      value: _fromThisPodcastKey
    },
    {
      label: 'From This Episode',
      value: _fromThisEpisodeKey
    }
  ],
  screenFilters: {
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear],
      sublist: [{ label: 'All', value: _allCategories }],
      hideSort: [_subscribedKey, _downloadedKey]
    },
    EpisodesScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey],
      sort: [_mostRecentKey, _topPastDay, _topPastWeek, _topPastMonth, _topPastYear],
      sublist: [],
      hideSort: []
    }
  }
}
