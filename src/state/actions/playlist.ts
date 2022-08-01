import { combineAndSortPlaylistItems } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import {
  addOrRemovePlaylistItem as addOrRemovePlaylistItemService,
  createPlaylist as createPlaylistService,
  deletePlaylistOnServer as deletePlaylistService,
  getPlaylist as getPlaylistService,
  getPlaylists as getPlaylistsService,
  toggleSubscribeToPlaylist as toggleSubscribeToPlaylistService,
  updatePlaylist as updatePlaylistService
} from '../../services/playlist'

export const addOrRemovePlaylistItem = async (playlistId: string, episodeId?: string, mediaRefId?: string) => {
  const globalState = getGlobal()
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

export const toggleSubscribeToPlaylist = async (id: string) => {
  const globalState = getGlobal()
  const subscribedPlaylistIds = await toggleSubscribeToPlaylistService(id)

  let subscribedPlaylists = []
  if (subscribedPlaylistIds && subscribedPlaylistIds.length > 0) {
    subscribedPlaylists = await getPlaylistsService({ playlistId: subscribedPlaylistIds })
  }

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        subscribedPlaylistIds
      }
    },
    playlists: {
      myPlaylists: globalState.playlists.myPlaylists,
      subscribedPlaylists
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYLISTS_UPDATED)
  })

  return subscribedPlaylistIds
}

export const getPlaylists = async (playlistId: string | []) => {
  const globalState = getGlobal()
  const results = await getPlaylistsService({ playlistId })
  setGlobal({
    playlists: {
      myPlaylists: globalState.playlists.myPlaylists,
      subscribedPlaylists: results
    }
  })
}

export const getPlaylist = async (id: string) => {
  const globalState = getGlobal()
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

export const updatePlaylist = async (data: any) => {
  const globalState = getGlobal()
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
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYLISTS_UPDATED)
  })
}

export const createPlaylist = async (data: any) => {
  const globalState = getGlobal()
  const newPlaylist = await createPlaylistService(data)
  const playlistsFlatListData = globalState.playlists.myPlaylists

  setGlobal({
    playlists: {
      myPlaylists: [newPlaylist, ...playlistsFlatListData],
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYLISTS_UPDATED)
  })
}

export const deletePlaylist = async (id: string) => {
  await deletePlaylistService(id)
  const globalState = getGlobal()
  const filteredPlaylistsFlatListData = globalState.playlists.myPlaylists.filter((x: any) => x.id !== id)

  setGlobal({
    playlists: {
      myPlaylists: [...filteredPlaylistsFlatListData],
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYLISTS_UPDATED)
  })
}
