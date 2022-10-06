// For mappings of key integer definitions, visit
// https://github.com/satoshisstream/satoshis.stream/blob/main/TLV_registry.md#field-7629169

// 7629169: SatoshiStreamStatsPodcast // the "podcast" subject according to SatoshiStream spec
// 7629175: SatoshiStreamStatsPodcastIndexId // the Podcast Index feedId for the podcast

import { SatoshiStreamStats } from 'podverse-shared'
import { getGlobal } from 'reactn'
import Config from 'react-native-config'
import { translate } from './i18n'
const uuidv4 = require('uuid/v4')

export const createSatoshiStreamStats = (
  podcastTitle: string,
  episodeTitle: string,
  podcastIndexPodcastId: string,
  currentPlaybackPosition: string,
  action: string,
  speed: string,
  pubkey: string,
  totalBatchedAmount: number,
  name: string,
  customKey: string,
  customValue: string
) => {
  const podcast = podcastTitle || translate('Untitled Podcast')
  const episode = episodeTitle || translate('Untitled Episode')
  const podcastIndexId = (podcastIndexPodcastId && parseInt(podcastIndexPodcastId, 10)) || null
  const ts = parseInt(currentPlaybackPosition, 10)

  const { name: senderName } = getGlobal().session.v4v.senderInfo

  return {
    '7629169': {
      podcast,
      feedID: podcastIndexId,
      episode,
      ts,
      action,
      speed,
      pubkey,
      value_msat_total: totalBatchedAmount * 1000,
      uuid: uuidv4(),
      app_name: Config.USER_AGENT_PREFIX,
      name,
      sender_name: senderName
    },
    '7629175': podcastIndexId,
    ...(customKey ? { [customKey]: customValue } : {})
  } as SatoshiStreamStats
}
