// For mappings of key integer definitions, visit
// https://github.com/satoshisstream/satoshis.stream/blob/main/TLV_registry.md#field-7629169

// 7629169: SatoshiStreamStatsPodcast // the "podcast" subject according to SatoshiStream spec
// 7629175: SatoshiStreamStatsPodcastIndexId // the Podcast Index feedId for the podcast

import { NowPlayingItem, SatoshiStreamStats } from 'podverse-shared'
import { getGlobal } from 'reactn'
import Config from 'react-native-config'
import { translate } from './i18n'
const uuidv4 = require('uuid/v4')

export const createSatoshiStreamStats = (
  nowPlayingItem: NowPlayingItem,
  currentPlaybackPosition: string,
  action: string,
  speed: string,
  pubkey: string,
  amount: string,
  name: string,
  customKey: string,
  customValue: string
) => {
  const podcast = nowPlayingItem?.podcastTitle || translate('Untitled Podcast')
  const episode = nowPlayingItem?.episodeTitle || translate('Untitled Episode')
  const podcastIndexId =
    (nowPlayingItem?.podcastIndexPodcastId && parseInt(nowPlayingItem.podcastIndexPodcastId, 10)) || null
  const ts = parseInt(currentPlaybackPosition, 10)
  const amountNum = parseInt(amount, 10) * 1000 // in millisats

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
      value_msat: amountNum,
      uuid: uuidv4(),
      app_name: Config.USER_AGENT_PREFIX,
      name,
      sender_name: senderName
    },
    '7629175': podcastIndexId,
    ...(customKey ? { [customKey]: customValue } : {})
  } as SatoshiStreamStats
}
