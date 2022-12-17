import { Platform } from 'react-native'
import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { processValueTransactionQueue, saveStreamingValueTransactionsToTransactionQueue } from '../../services/v4v/v4v'
import { getBoostagramItemValueTags, v4vGetActiveProviderInfo } from '../../state/actions/v4v/v4v'
import {
  getPlaybackSpeed,
  playerCheckIfStateIsPlaying,
  playerGetState
} from '../player'

let valueStreamingAccumulatorSecondCount = 0
let valueStreamingProcessQueueSecondCount = 0

const incrementStreamingIntervalCount = async (isVideo?: boolean) => {
  // player progress interval for our react-native-video implementation
  // is always one second.
  if (isVideo) {
    valueStreamingAccumulatorSecondCount++
    valueStreamingProcessQueueSecondCount++
  }
  // on iOS, the player-progress-updated event is fired relative to the
  // player's speed, so we normalize it to continue incrementing by 1 second.
  else if (Platform.OS === 'ios') {
    const playbackSpeed = await getPlaybackSpeed()
    valueStreamingAccumulatorSecondCount = valueStreamingAccumulatorSecondCount + 1 / playbackSpeed
    valueStreamingProcessQueueSecondCount = valueStreamingProcessQueueSecondCount + 1 / playbackSpeed
  }
  // on Android, the player-progress-updated event is fired every 1 second
  // regardless of playback speed.
  else {
    valueStreamingAccumulatorSecondCount++
    valueStreamingProcessQueueSecondCount++
  }
}

const handleValueStreamingMinutePassed = async () => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  const valueTags = nowPlayingItem.episodeValue || nowPlayingItem.podcastValue || []

  const { activeProviderSettings } = v4vGetActiveProviderInfo(valueTags)
  const { activeProvider } = v4vGetActiveProviderInfo(getBoostagramItemValueTags(nowPlayingItem))
  const { streamingAmount } = activeProviderSettings || {}

  valueStreamingAccumulatorSecondCount = 0

  // Send batch of streaming value from queue every 5 minutes
  const shouldProcessQueue = valueStreamingProcessQueueSecondCount >= 600
  if (shouldProcessQueue) {
    valueStreamingProcessQueueSecondCount = 0
  }

  if (Array.isArray(valueTags) && valueTags.length > 0 && streamingAmount && activeProvider?.key) {
    await saveStreamingValueTransactionsToTransactionQueue(
      valueTags,
      nowPlayingItem,
      streamingAmount,
      activeProvider.key
    )
  }

  return shouldProcessQueue
}

export const handleValueStreamingTimerIncrement = (isVideo?: boolean) => {
  const globalState = getGlobal()
  const { streamingValueOn } = globalState.session.v4v
  if (streamingValueOn) {
    playerGetState().then(async (playbackState) => {
      let shouldProcessQueue = false
      if (playerCheckIfStateIsPlaying(playbackState)) {
        await incrementStreamingIntervalCount(isVideo)

        if (valueStreamingAccumulatorSecondCount && valueStreamingAccumulatorSecondCount >= 60) {
          shouldProcessQueue = await handleValueStreamingMinutePassed()
        }
      }

      if (shouldProcessQueue) {
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
