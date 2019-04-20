import { setGlobal } from 'reactn'
import { getPublicUser as getPublicUserService, getPublicUsersByQuery as getPublicUsersByQueryService,
  toggleSubscribeToUser as toggleSubscribeToUserService } from '../../services/user'

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
    screenPlaylists: {
      flatListData: screenProfilesFlatListData
    },
    screenPlaylist: {
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
