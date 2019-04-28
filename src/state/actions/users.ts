import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { addOrUpdateHistoryItem as addOrUpdateHistoryItemService, filterItemFromHistoryItems,
  removeHistoryItem as removeHistoryItemService } from '../../services/history'
import { addQueueItemLast, addQueueItemNext, removeQueueItem, setAllQueueItems } from '../../services/queue'
import { clearUserHistoryItems as clearUserHistoryItemsService, getLoggedInUserPlaylists as getLoggedInUserPlaylistsService,
  getPublicUser as getPublicUserService, getPublicUsersByQuery as getPublicUsersByQueryService,
  toggleSubscribeToUser as toggleSubscribeToUserService, updateLoggedInUser as updateLoggedInUserService
  } from '../../services/user'

export const getPublicUsersByQuery = async (userIds: string, page: number = 1) => {
  const results = await getPublicUsersByQueryService({
    page,
    userIds
  })

  setGlobal({
    screenProfiles: {
      flatListData: results[0]
    }
  })

  return results
}

export const getPublicUser = async (id: string, globalState: any) => {
  const newUser = await getPublicUserService(id)
  const screenProfilesFlatListData = globalState.screenProfiles.flatListData
  const screenProfileFlatListData = globalState.screenProfile.flatListData

  const foundIndex = screenProfilesFlatListData.findIndex((x: any) => x.id === id)
  if (foundIndex > -1) {
    screenProfilesFlatListData[foundIndex] = newUser
  }

  setGlobal({
    screenProfiles: {
      flatListData: screenProfilesFlatListData
    },
    screenProfile: {
      flatListData: screenProfileFlatListData,
      user: newUser
    }
  })

  return newUser
}

export const toggleSubscribeToUser = async (id: string) => {
  const subscribedUserIds = await toggleSubscribeToUserService(id)
  setGlobal({
    session: {
      userInfo: {
        subscribedUserIds
      }
    }
  })
}

export const getLoggedInUserPlaylists = async (globalState: any) => {
  const results = await getLoggedInUserPlaylistsService()
  setGlobal({
    screenPlaylists: {
      myPlaylists: results[0],
      subscribedPlaylists: globalState.screenPlaylists.subscribedPlaylists
    },
    screenPlaylistsAddTo: {
      myPlaylists: results[0]
    }
  })
}

export const updateLoggedInUser = async (data: any, globalState: any) => {
  const newUser = await updateLoggedInUserService(data)
  const screenProfilesFlatListData = globalState.screenProfiles.flatListData
  const screenProfileFlatListData = globalState.screenProfile.flatListData
  const foundIndex = screenProfilesFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    screenProfilesFlatListData[foundIndex] = newUser
  }

  setGlobal({
    screenProfiles: {
      flatListData: screenProfilesFlatListData
    },
    screenProfile: {
      flatListData: screenProfileFlatListData,
      user: newUser
    }
  })
}

export const updateUserQueueItems = async (queueItems: NowPlayingItem[], isLoggedIn: boolean, globalState: any) => {
  const results = await setAllQueueItems(queueItems, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const addUserQueueItemNext = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemNext(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const addUserQueueItemLast = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemLast(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const removeUserQueueItem = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await removeQueueItem(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const addOrUpdateUserHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addOrUpdateHistoryItemService(item, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: results
      }
    }
  })
  return results
}

export const clearUserHistoryItems = async (isLoggedIn: boolean, globalState: any) => {
  await clearUserHistoryItemsService()
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: []
      }
    }
  })
  return []
}

export const removeUserHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  await removeHistoryItemService(item, isLoggedIn)
  const results = filterItemFromHistoryItems(globalState.session.userInfo.historyItems, item)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: results
      }
    }
  })
  return results
}
