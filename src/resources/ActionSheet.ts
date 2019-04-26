import { IActionSheet } from '../resources/Interfaces'
import { setNowPlayingItem } from '../services/player'
import { addUserQueueItemLast, addUserQueueItemNext } from '../state/actions/auth'

const mediaMoreButtons = (item: any, isLoggedIn: boolean, globalState: any) => [
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
    onPress: () => addUserQueueItemNext(item, isLoggedIn, globalState)
  },
  {
    key: 'queueLast',
    text: 'Queue: Last',
    onPress: () => addUserQueueItemLast(item, isLoggedIn, globalState)
  },
  {
    key: 'addToPlaylist',
    text: 'Add to Playlist',
    onPress: () => console.log('Add to Playlist')
  }
]

export const ActionSheet: IActionSheet = {
  media: {
    moreButtons: mediaMoreButtons
  }
}
