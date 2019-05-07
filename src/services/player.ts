import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import TrackPlayer from 'react-native-track-player'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { filterItemFromQueueItems, getQueueItems, setAllQueueItems } from './queue'

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer().then(() => {
  TrackPlayer.registerPlaybackService(() => require('./playerEvents'))
})

export const PVTrackPlayer = TrackPlayer

export const getNowPlayingItem = async () => {
  try {
    const itemString = await RNSecureKeyStore.get(PV.Keys.NOW_PLAYING_ITEM)
    return JSON.parse(itemString)
  } catch (error) {
    return null
  }
}

export const playerJumpBackward = async (seconds: number) => {
  const position = await TrackPlayer.getPosition()
  const newPosition = position - seconds
  TrackPlayer.seekTo(newPosition)
  return newPosition
}

export const playerJumpForward = async (seconds: number) => {
  const position = await TrackPlayer.getPosition()
  const newPosition = position + seconds
  TrackPlayer.seekTo(newPosition)
  return newPosition
}

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  const { clipId, episodeId, episodeMediaUrl, episodeTitle = 'untitled episode', podcastImageUrl,
    podcastTitle = 'untitled podcast' } = item

  const items = await getQueueItems(isLoggedIn)

  let filteredItems = [] as any[]
  filteredItems = filterItemFromQueueItems(items, item)
  await setAllQueueItems(filteredItems, isLoggedIn)
  await addOrUpdateHistoryItem(item, isLoggedIn)

  RNSecureKeyStore.set(
    PV.Keys.NOW_PLAYING_ITEM,
    item ? JSON.stringify(item) : null,
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )

  const id = clipId || episodeId
  if (id && episodeMediaUrl) {
    const currentTrackId = await TrackPlayer.getCurrentTrack()
    await TrackPlayer.add({
      id,
      url: episodeMediaUrl,
      title: episodeTitle,
      artist: podcastTitle,
      ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
    })

    if (currentTrackId && id !== currentTrackId) {
      await TrackPlayer.skipToNext()
    }
  }

  return {
    nowPlayingItem: item,
    queueItems: filteredItems
  }
}

export const setPlaybackSpeed = async (rate: number) => {
  await TrackPlayer.setRate(rate)
}

export const setPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position)
}

export const togglePlay = async () => {
  const state = await TrackPlayer.getState()
  if (state === TrackPlayer.STATE_PLAYING) {
    TrackPlayer.pause()
  } else {
    TrackPlayer.play()
  }
}
