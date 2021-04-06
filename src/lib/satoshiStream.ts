import { NowPlayingItem, SatoshiStreamStats } from 'podverse-shared'
import { translate } from './i18n'

export const createSatoshiStreamStats = (
  nowPlayingItem: NowPlayingItem,
  timestamp: number,
  action: string,
  speed: number,
  pubkey: string,
  amount: number
) => {
  const podcast = nowPlayingItem?.podcastTitle || translate('Untitled Podcast')
  const episode = nowPlayingItem?.episodeTitle || translate('Untitled Episode')
  const ts = timestamp

  return {
    podcast,
    episode,
    ts,
    action,
    speed,
    pubkey,
    amount
  } as SatoshiStreamStats
}
