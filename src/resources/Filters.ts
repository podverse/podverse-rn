import { IFilters } from './Interfaces'

/* NOTE: Filter values *have to use hyphen-case* because they are passed as
 * query param values in requests to the API, and the API expects hyphen-case.
 */

export const Filters: IFilters = {
  _subscribedKey: 'subscribed',
  _downloadedKey: 'downloaded',
  _allPodcastsKey: 'all-podcasts',
  _customFeedsKey: 'custom-feeds',
  _categoryKey: 'category',
  _alphabeticalKey: 'alphabetical',
  _mostRecentKey: 'most-recent',
  _randomKey: 'random',
  _topPastDay: 'top-past-day',
  _topPastWeek: 'top-past-week',
  _topPastMonth: 'top-past-month',
  _topPastYear: 'top-past-year',
  _topAllTime: 'top-all-time',
  _chronologicalKey: 'chronological',
  _oldestKey: 'oldest',
  _myClipsKey: 'my-clips',
  _allEpisodesKey: 'all-episodes',
  _podcastsKey: 'podcasts',
  _episodesKey: 'episodes',
  _showCompletedKey: 'show-completed',
  _clipsKey: 'clips',
  _chaptersKey: 'chapters',
  _playlistsKey: 'playlists',
  _myPlaylistsKey: 'my-playlists',
  _fromThisPodcastKey: 'from-this-podcast',
  _fromThisEpisodeKey: 'from-this-episode',
  _sectionCategoryKey: 'section-category',
  _sectionFilterKey: 'section-filter',
  _sectionFromKey: 'section-from',
  _sectionMyPlaylistsKey: 'section-my-playlists',
  _sectionSortKey: 'section-sort',
  _sectionSubscribedPlaylistsKey: 'section-subscribed-playlists'
}
