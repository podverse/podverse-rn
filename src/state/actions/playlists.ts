import { setGlobal } from 'reactn'
import { toggleSubscribeToPlaylist as toggleSubscribe } from '../../services/playlist'

export const toggleSubscribeToPlaylist = async (id: string) => {
  const subscribedPlaylistIds = await toggleSubscribe(id)
  setGlobal({
    session: {
      userInfo: {
        subscribedPlaylistIds
      }
    }
  })
}
