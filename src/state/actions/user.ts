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
    profiles: {
      flatListData: results[0]
    }
  })

  return results
}

export const getPublicUser = async (id: string, globalState: any) => {
  const newUser = await getPublicUserService(id)
  const profileFlatListData = globalState.profile.flatListData
  const profilesFlatListData = globalState.profiles.flatListData

  const foundIndex = profilesFlatListData.findIndex((x: any) => x.id === id)
  if (foundIndex > -1) {
    profilesFlatListData[foundIndex] = newUser
  }

  setGlobal({
    profile: {
      user: newUser
    },
    profiles: {
      flatListData: profilesFlatListData
    }
  })

  return {
    profileFlatListData,
    user: newUser
  }
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
    playlists: {
      myPlaylists: results[0],
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
    }
  })
}

export const updateLoggedInUser = async (data: any, globalState: any) => {
  const userInfo = await updateLoggedInUserService(data)
  const profilesFlatListData = globalState.profiles.flatListData
  const profileFlatListData = globalState.profile.flatListData
  const foundIndex = profilesFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    profilesFlatListData[foundIndex] = userInfo
  }

  setGlobal({
    profile: {
      flatListData: profileFlatListData,
      user: userInfo
    },
    profiles: {
      flatListData: profilesFlatListData
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
