import { getGlobal } from 'reactn'

export const checkIfNotificationsEnabledForPodcastId = (podcastId?: string) => {
  if (!podcastId) return false
  const { session } = getGlobal()

  if (!session.isLoggedIn) return false

  const notificationsEnabled = session?.userInfo?.notificationsEnabled
  if (!notificationsEnabled) return false

  const notifications = session?.userInfo?.notifications || []
  return notifications.some((notification: any) => {
    return notification?.podcast?.id === podcastId
  })
}
