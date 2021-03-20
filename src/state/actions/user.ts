import { getGlobal, setGlobal } from 'reactn'
import {
  getLoggedInUserPlaylists as getLoggedInUserPlaylistsService,
  getLoggedInUserPlaylistsCombined as getLoggedInUserPlaylistsCombinedService,
  getPublicUser as getPublicUserService,
  getPublicUsersByQuery as getPublicUsersByQueryService,
  toggleSubscribeToUser as toggleSubscribeToUserService,
  updateLoggedInUser as updateLoggedInUserService
} from '../../services/user'

export const getPublicUsersByQuery = async (userIds: string, page = 1) => {
  const results = await getPublicUsersByQueryService({
    page,
    userIds
  })

  setGlobal({
    profiles: {
      flatListData: results[0],
      flatListDataTotalCount: results[1]
    }
  })

  return results
}

export const getPublicUser = async (id: string) => {
  const globalState = getGlobal()
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
      ...globalState.profiles,
      flatListData: profilesFlatListData
    }
  })

  return {
    profileFlatListData,
    user: newUser
  }
}

export const toggleSubscribeToUser = async (id: string) => {
  const globalState = getGlobal()
  const subscribedUserIds = await toggleSubscribeToUserService(id)

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

export const getLoggedInUserPlaylistsCombined = async () => {
  const { createdPlaylists, subscribedPlaylists } = await getLoggedInUserPlaylistsCombinedService()

  setGlobal({
    playlists: {
      myPlaylists: createdPlaylists,
      subscribedPlaylists
    }
  })
}

export const getLoggedInUserPlaylists = async () => {
  const globalState = getGlobal()
  const results = await getLoggedInUserPlaylistsService()

  setGlobal({
    playlists: {
      myPlaylists: results[0],
      subscribedPlaylists: globalState.playlists.subscribedPlaylists
    }
  })
}

export const updateLoggedInUser = async (data: any) => {
  const globalState = getGlobal()
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
      ...globalState.profiles,
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
