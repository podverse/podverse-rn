import { getGlobal } from 'reactn'

export const checkIfNotificationsEnabledForPodcastId = (podcastId?: string) => {
  if (!podcastId) return false
  const notifications = getGlobal()?.session?.userInfo?.notifications || []
  return notifications.some((notification: any) => {
    return notification?.podcast?.id === podcastId
  })
}
