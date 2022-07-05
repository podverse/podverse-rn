import { translate } from '../lib/i18n'

const _addLast = 'last'
const _addNext = 'next'

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

export const Queue = {
  autoQueuePositionOptions
}
