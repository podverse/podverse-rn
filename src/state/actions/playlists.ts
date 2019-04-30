import { setGlobal } from 'reactn'
import { combineAndSortPlaylistItems } from '../../lib/utility'
import { addOrRemovePlaylistItem as addOrRemovePlaylistItemService, getPlaylist as getPlaylistService,
  getPlaylists as getPlaylistsService, toggleSubscribeToPlaylist as toggleSubscribeToPlaylistService,
  updatePlaylist as updatePlaylistService } from '../../services/playlist'

export const addOrRemovePlaylistItem = async (playlistId: string, episodeId?: string, mediaRefId?: string, globalState?: any) => {
  const { playlistItemCount } = await addOrRemovePlaylistItemService(playlistId, episodeId, mediaRefId)
  const screenPlaylistsFlatListData = globalState.screenPlaylists.myPlaylists
  const foundIndex = screenPlaylistsFlatListData.findIndex((x: any) => x.id === playlistId)

  if (foundIndex > -1) {
    screenPlaylistsFlatListData[foundIndex] = {
      ...screenPlaylistsFlatListData[foundIndex],
      itemCount: playlistItemCount
    }
  }

  setGlobal({
    screenPlaylists: {
      myPlaylists: screenPlaylistsFlatListData,
      subscribedPlaylists: globalState.screenPlaylists.subscribedPlaylists
    },
    screenPlaylistsAddTo: {
      myPlaylists: screenPlaylistsFlatListData
    }
  })

  return playlistItemCount
}

export const toggleSubscribeToPlaylist = async (id: string, globalState: any) => {
  const subscribedPlaylistIds = await toggleSubscribeToPlaylistService(id, globalState.session.isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        subscribedPlaylistIds
      }
    }
  })
}

export const getPlaylists = async (playlistId: string, globalState: any) => {
  const results = await getPlaylistsService({ playlistId })
  setGlobal({
    screenPlaylists: {
      myPlaylists: globalState.screenPlaylists.myPlaylists,
      subscribedPlaylists: results
    }
  })
}

export const getPlaylist = async (id: string, globalState: any) => {
  const newPlaylist = await getPlaylistService(id)
  const { episodes, itemsOrder, mediaRefs } = newPlaylist
  const screenPlaylistsMyPlaylists = globalState.screenPlaylists.myPlaylists
  const screenPlaylistsSubscribed = globalState.screenPlaylists.subscribedPlaylists

  const foundIndexMy = screenPlaylistsMyPlaylists.findIndex((x: any) => x.id === id)
  if (foundIndexMy > -1) {
    screenPlaylistsMyPlaylists[foundIndexMy] = newPlaylist
  }

  const foundIndexSubscribed = screenPlaylistsSubscribed.findIndex((x: any) => x.id === id)
  if (foundIndexSubscribed > -1) {
    screenPlaylistsSubscribed[foundIndexSubscribed] = newPlaylist
  }

  setGlobal({
    screenPlaylists: {
      myPlaylists: screenPlaylistsMyPlaylists,
      subscribedPlaylists: screenPlaylistsSubscribed
    },
    screenPlaylist: {
      flatListData: combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder),
      playlist: newPlaylist
    }
  })

  return newPlaylist
}

export const updatePlaylist = async (data: any, globalState: any) => {
  const newPlaylist = await updatePlaylistService(data)
  const screenPlaylistsFlatListData = globalState.screenPlaylists.myPlaylists

  const { episodes, itemsOrder, mediaRefs } = newPlaylist
  const screenPlaylistFlatListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)
  const foundIndex = screenPlaylistsFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    screenPlaylistsFlatListData[foundIndex] = newPlaylist
  }

  setGlobal({
    screenPlaylists: {
      myPlaylists: screenPlaylistsFlatListData,
      subscribedPlaylists: globalState.screenPlaylists.subscribedPlaylists
    },
    screenPlaylist: {
      flatListData: screenPlaylistFlatListData,
      playlist: newPlaylist
    }
  })
}
