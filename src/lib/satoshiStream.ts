import { NowPlayingItem, SatoshiStreamStats } from 'podverse-shared'
import { translate } from './i18n'

  // For mappings of key integer definitions, visit
  // https://github.com/satoshisstream/satoshis.stream/blob/main/TLV_registry.md#field-7629169
  
  // 7629169: SatoshiStreamStatsPodcast // the "podcast" subject according to SatoshiStream spec

export const createSatoshiStreamStats = (
  nowPlayingItem: NowPlayingItem,
  currentPlaybackPosition: string,
  action: string,
  speed: string,
  pubkey: string,
  amount: string
) => {
  const podcast = nowPlayingItem?.podcastTitle || translate('Untitled Podcast')
  const episode = nowPlayingItem?.episodeTitle || translate('Untitled Episode')
  const ts = currentPlaybackPosition

  return {
    7629169: {
      podcast,
      episode,
      ts,
      action,
      speed,
      pubkey,
      amount
    }
  } as SatoshiStreamStats
}
