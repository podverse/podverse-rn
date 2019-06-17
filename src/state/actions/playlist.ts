import { setGlobal } from 'reactn'
import { combineAndSortPlaylistItems } from '../../lib/utility'
import { addOrRemovePlaylistItem as addOrRemovePlaylistItemService, getPlaylist as getPlaylistService,
  getPlaylists as getPlaylistsService, toggleSubscribeToPlaylist as toggleSubscribeToPlaylistService,
  updatePlaylist as updatePlaylistService } from '../../services/playlist'

export const addOrRemovePlaylistItem = async (playlistId: string, episodeId?: string, mediaRefId?: string, globalState?: any) => {
  const { playlistItemCount } = await addOrRemovePlaylistItemService(playlistId, episodeId, mediaRefId)
  const playlistsFlatListData = globalState.playlists.myPlaylists
  const foundIndex = playlistsFlatListData.findIndex((x: any) => x.id === playlistId)

  if (foundIndex > -1) {
    playlistsFlatListData[foundIndex] = {
      ...playlistsFlatListData[foundIndex],
      itemCount: playlistItemCount
    }
  }

  setGlobal({
    playlists: {
      myPlaylists: playlistsFlatListData,
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
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
    playlists: {
      myPlaylists: globalState.playlists.myPlaylists,
      subscribedPlaylists: results
    }
  })
}

export const getPlaylist = async (id: string, globalState: any) => {
  const newPlaylist = await getPlaylistService(id)
  const { episodes, itemsOrder, mediaRefs } = newPlaylist
  const playlistsMyPlaylists = globalState.playlists.myPlaylists
  const playlistsSubscribed = globalState.playlists.subscribedPlaylists

  const foundIndexMy = playlistsMyPlaylists.findIndex((x: any) => x.id === id)
  if (foundIndexMy > -1) {
    playlistsMyPlaylists[foundIndexMy] = newPlaylist
  }

  const foundIndexSubscribed = playlistsSubscribed.findIndex((x: any) => x.id === id)
  if (foundIndexSubscribed > -1) {
    playlistsSubscribed[foundIndexSubscribed] = newPlaylist
  }
  const flatListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)
  setGlobal({
    playlists: {
      myPlaylists: playlistsMyPlaylists,
      subscribedPlaylists: playlistsSubscribed
    },
    screenPlaylist: {
      flatListData,
      flatListDataTotalCount: flatListData.length,
      playlist: newPlaylist
    }
  })

  return newPlaylist
}

export const updatePlaylist = async (data: any, globalState: any) => {
  const newPlaylist = await updatePlaylistService(data)
  const playlistsFlatListData = globalState.playlists.myPlaylists

  const { episodes, itemsOrder, mediaRefs } = newPlaylist
  const screenPlaylistFlatListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)
  const foundIndex = playlistsFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    playlistsFlatListData[foundIndex] = newPlaylist
  }

  setGlobal({
    playlists: {
      myPlaylists: playlistsFlatListData,
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
    },
    screenPlaylist: {
      flatListData: screenPlaylistFlatListData,
      flatListDataTotalCount: screenPlaylistFlatListData.length,
      playlist: newPlaylist
    }
  })
}
