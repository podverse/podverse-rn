const _subscribedKey = 'subscribed'
const _downloadedKey = 'downloaded'
const _allPodcastsKey = 'allPodcasts'
const _categoryKey = 'category'
const _allCategoriesKey = 'allCategories'
const _alphabeticalKey = 'alphabetical'
const _mostRecentKey = 'most-recent'
const _randomKey = 'random'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'
const _chronologicalKey = 'chronological'
const _oldestKey = 'oldest'
const _myClipsKey = 'clips'
const _allEpisodesKey = 'allEpisodes'
const _podcastsKey = 'podcasts'
const _episodesKey = 'episodes'
const _clipsKey = 'clips'
const _playlistKey = 'playlist'
const _aboutKey = 'about'
const _showNotesKey = 'showNotes'
const _titleKey = 'title'
const _myPlaylistsKey = 'myPlaylists'
const _fromThisPodcast = 'fromThisPodcast'
const _fromThisEpisode = 'fromThisEpisode'
const _allCategories = 'allCategories'

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
