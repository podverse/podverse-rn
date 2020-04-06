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
  _fromThisPodcast,
  _fromThisEpisode,
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
      label: 'Chronological',
      value: _chronologicalKey
    },
    {
      label: 'Alphabetical',
      value: _alphabeticalKey
    },
    {
      label: 'Most Recent',
      value: _mostRecentKey
    },
    {
      label: 'Oldest',
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
      label: 'Random',
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
      value: _fromThisPodcast
    },
    {
      label: 'From This Episode',
      value: _fromThisEpisode
    }
  ],
  screenFilters: {
    PodcastsScreen: {
      type: [_subscribedKey, _downloadedKey, _allPodcastsKey, _categoryKey],
      sort: [_topPastDay, _topPastWeek, _topPastMonth, _topPastYear],
      sublist: [{ label: 'All', value: _allCategories }],
      hideSort: [_subscribedKey, _downloadedKey]
    }
  }
}
