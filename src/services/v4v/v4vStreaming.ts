import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { processValueTransactionQueue, saveStreamingValueTransactionsToTransactionQueue } from '../../services/v4v/v4v'
import { getBoostagramItemValueTags, v4vGetActiveProviderInfo } from '../../state/actions/v4v/v4v'
import {
  playerCheckIfStateIsPlaying,
  playerGetState
} from '../player'

let valueStreamingIntervalSecondCount = 1

export const handleValueStreamingTimerIncrement = () => {
  const globalState = getGlobal()
  const { streamingValueOn } = globalState.session.v4v

  if (streamingValueOn) {
    playerGetState().then(async (playbackState) => {
      if (playerCheckIfStateIsPlaying(playbackState)) {
        valueStreamingIntervalSecondCount++

        if (valueStreamingIntervalSecondCount && valueStreamingIntervalSecondCount % 60 === 0) {
          await handleValueStreamingMinutePassed()
        }
      }

      // Send batch of streaming value from queue every 5 minutes
      if (valueStreamingIntervalSecondCount === 300) {
        valueStreamingIntervalSecondCount = 1

        const { errors, transactions, totalAmount } = await processValueTransactionQueue()
        if (transactions.length > 0 && totalAmount > 0) {
          setGlobal({
            bannerInfo: {
              show: true,
              description: translate('Streaming Value Sent'),
              errors,
              transactions,
              totalAmount
            }
          })
        }
      }
    })
  }
}

const handleValueStreamingMinutePassed = async () => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  const valueTags = nowPlayingItem.episodeValue || nowPlayingItem.podcastValue || []

  const { activeProviderSettings } = v4vGetActiveProviderInfo(valueTags)
  const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(nowPlayingItem))
  const { streamingAmount } = activeProviderSettings || {}

  if (Array.isArray(valueTags) && valueTags.length > 0 && streamingAmount && activeProvider?.key) {
    await saveStreamingValueTransactionsToTransactionQueue(
      valueTags,
      nowPlayingItem,
      streamingAmount,
      activeProvider.key
    )
  }
}
