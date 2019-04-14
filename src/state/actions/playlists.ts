import { setGlobal } from 'reactn'
import { combineAndSortPlaylistItems } from '../../lib/utility'
import { getPlaylist as getPlaylistService, getPlaylists as getPlaylistsService,
  toggleSubscribeToPlaylist as toggleSubscribe, updatePlaylist as updatePlaylistService
  } from '../../services/playlist'

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

export const getPlaylists = async (playlistId: string) => {
  const results = await getPlaylistsService({ playlistId })
  setGlobal({
    screenPlaylists: {
      flatListData: results
    }
  })
}

export const getPlaylist = async (id: string, globalState: any) => {
  const newPlaylist = await getPlaylistService(id)
  const { episodes, itemsOrder, mediaRefs } = newPlaylist
  const screenPlaylistsFlatListData = globalState.screenPlaylists.flatListData

  const foundIndex = screenPlaylistsFlatListData.findIndex((x: any) => x.id === id)
  if (foundIndex > -1) {
    screenPlaylistsFlatListData[foundIndex] = newPlaylist
  }

  setGlobal({
    screenPlaylists: {
      flatListData: screenPlaylistsFlatListData
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
  const screenPlaylistsFlatListData = globalState.screenPlaylists.flatListData
  const screenPlaylistFlatListData = globalState.screenPlaylist.flatListData
  const foundIndex = screenPlaylistsFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    screenPlaylistsFlatListData[foundIndex] = newPlaylist
  }

  setGlobal({
    screenPlaylists: {
      flatListData: screenPlaylistsFlatListData
    },
    screenPlaylist: {
      flatListData: screenPlaylistFlatListData,
      playlist: newPlaylist
    }
  })
}
