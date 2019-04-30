import { IActionSheet } from '../resources/Interfaces'
import { setNowPlayingItem } from '../services/player'
import { addQueueItemLast, addQueueItemNext } from '../state/actions/queue'
import { PV } from './PV'

const mediaMoreButtons = (item: any, isLoggedIn: boolean, globalState: any, navigation: any, handleDismiss: any) => [
  {
    key: 'stream',
    text: 'Stream',
    onPress: () => setNowPlayingItem(item, isLoggedIn)
  },
  {
    key: 'download',
    text: 'Download',
    onPress: () => console.log('Download')
  },
  {
    key: 'queueNext',
    text: 'Queue: Next',
    onPress: () => addQueueItemNext(item, isLoggedIn, globalState)
  },
  {
    key: 'queueLast',
    text: 'Queue: Last',
    onPress: () => addQueueItemLast(item, isLoggedIn, globalState)
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
