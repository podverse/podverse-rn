import { translate } from '../lib/i18n'

const _addLast = 'last'
const _addNext = 'next'
const _newerKey = 'newer'
const _olderKey = 'older'
const _offKey = 'off'

export type AutoPlayEpisodesFromPodcast = 'newer' | 'older' | 'off'

const autoQueuePositionOptions = [
  {
    label: translate('Next'),
    value: _addNext
  },
  {
    label: translate('Last'),
    value: _addLast
  }
]

const autoPlayEpisodesFromPodcastOptions = [
  {
    label: translate('Newer'),
    value: _newerKey
  },
  {
    label: translate('Older'),
    value: _olderKey
  },
  {
    label: translate('Off'),
    value: _offKey
  },
]

export const Queue = {
  autoQueuePositionOptions,
  autoPlayEpisodesFromPodcastOptions,
  keys: {
    _addLast,
    _addNext,
    _newerKey,
    _olderKey,
    _offKey
  }
}
