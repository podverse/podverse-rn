import { IActionSheet } from '../resources/Interfaces'
import { setNowPlayingItem } from '../state/actions/player'
import { addQueueItemLast, addQueueItemNext } from '../state/actions/queue'
import { PV } from './PV'

const mediaMoreButtons = (item: any, isLoggedIn: boolean, globalState: any, navigation: any, handleDismiss: any) => [
  {
    key: 'stream',
    text: 'Stream',
    onPress: async () => {
      handleDismiss()
      await setNowPlayingItem(item, isLoggedIn)
    }
  },
  {
    key: 'download',
    text: 'Download',
    onPress: () => {
      handleDismiss()
      console.log('Download')
    }
  },
  {
    key: 'queueNext',
    text: 'Queue: Next',
    onPress: async () => {
      handleDismiss()
      await addQueueItemNext(item, isLoggedIn, globalState)
    }
  },
  {
    key: 'queueLast',
    text: 'Queue: Last',
    onPress: async () => {
      handleDismiss()
      await addQueueItemLast(item, isLoggedIn, globalState)
    }
  },
  {
    key: 'addToPlaylist',
    text: 'Add to Playlist',
    onPress: () => {
      handleDismiss()
      navigation.navigate(
        PV.RouteNames.PlaylistsAddToScreen,
        { ...(item.clipId ? { mediaRefId: item.clipId } : { episodeId: item.episodeId }) }
      )
    }
  }
]

export const ActionSheet: IActionSheet = {
  media: {
    moreButtons: mediaMoreButtons
  }
}
