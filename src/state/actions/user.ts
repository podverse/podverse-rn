import { setGlobal } from 'reactn'
import { getLoggedInUserPlaylists as getLoggedInUserPlaylistsService,
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

export const toggleSubscribeToUser = async (id: string, isLoggedIn: boolean, globalState: any) => {
  const subscribedUserIds = await toggleSubscribeToUserService(id, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
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
  const userInfo = await updateLoggedInUserService(data)
  const screenProfilesFlatListData = globalState.screenProfiles.flatListData
  const screenProfileFlatListData = globalState.screenProfile.flatListData
  const foundIndex = screenProfilesFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    screenProfilesFlatListData[foundIndex] = userInfo
  }

  setGlobal({
    screenProfiles: {
      flatListData: screenProfilesFlatListData
    },
    screenProfile: {
      flatListData: screenProfileFlatListData,
      user: userInfo
    },
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        ...userInfo
      }
    }
  })
}
