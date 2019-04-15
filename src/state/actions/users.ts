import { setGlobal } from 'reactn'
import { toggleSubscribeToUser as toggleSubscribeToUserService } from '../../services/user'

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
