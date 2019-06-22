import { IActionSheet } from '../resources/Interfaces'
import { setNowPlayingItem } from '../state/actions/player'
import { addQueueItemLast, addQueueItemNext } from '../state/actions/queue'
import { PV } from './PV'

// NOTE: handleDismiss should return a promiseto ensure the state update has completed before calling
// setNowPlayingItem. setNowPlayingItem seems to be resource intensive, and will delay re-rendering of
// handleDismiss without the promise.
const mediaMoreButtons = (item: any = {}, isLoggedIn: boolean, globalState: any, navigation: any,
                          handleDismiss: any, handleDownload: any) => {
  const isDownloading = globalState.downloadsActive && globalState.downloadsActive[item.episodeId]
  const downloadingText = isDownloading ? 'Downloading' : 'Download'

  const isDownloaded = globalState.downloadedEpisodeIds.some((x: any) => x === item.episodeId)

  const buttons = []

  if (isDownloaded) {
    buttons.push({
      key: 'play',
      text: 'Play',
      onPress: async () => {
        await handleDismiss()
        await setNowPlayingItem(item, globalState, false, true)
      }
    })
  } else {
    buttons.push(
      {
        key: 'stream',
        text: 'Stream',
        onPress: async () => {
          await handleDismiss()
          await setNowPlayingItem(item, globalState, false, true)
        }
      },
      {
        key: 'download',
        text: downloadingText,
        isDownloading,
        onPress: async () => {
          await handleDismiss()
          handleDownload()
        }
      }
    )
  }

  buttons.push(
    {
      key: 'queueNext',
      text: 'Queue: Next',
      onPress: async () => {
        await handleDismiss()
        await addQueueItemNext(item, isLoggedIn, globalState)
      }
    },
    {
      key: 'queueLast',
      text: 'Queue: Last',
      onPress: async () => {
        await handleDismiss()
        await addQueueItemLast(item, isLoggedIn, globalState)
      }
    },
    {
      key: 'addToPlaylist',
      text: 'Add to Playlist',
      onPress: async () => {
        await handleDismiss()
        navigation.navigate(
          PV.RouteNames.PlaylistsAddToScreen,
          { ...(item.clipId ? { mediaRefId: item.clipId } : { episodeId: item.episodeId }) }
        )
      }
    }
  )

  if (navigation.getParam('includeGoToPodcast')) {
    buttons.push({
      key: 'goToPodcast',
      text: 'Go to Podcast',
      onPress: async () => {
        await handleDismiss()
        navigation.navigate(PV.RouteNames.EpisodePodcastScreen,{ podcastId: item.podcastId })
      }
    })
  }

  return buttons
}

export const ActionSheet: IActionSheet = {
  media: {
    moreButtons: mediaMoreButtons
  }
}
