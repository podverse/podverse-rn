import { getGlobal, setGlobal } from 'reactn'
import {
  AutoQueueSettingsPosition,
  getAutoQueueSettings,
  getAutoQueueSettingsPosition,
  setAutoQueueSettingsPosition,
  updateAutoQueueSettings as updateAutoQueueSettingsService
} from '../../services/autoQueue'

export const initAutoQueue = async () => {
  const [autoQueueSettings, autoQueueSettingsPosition] = await Promise.all([
    getAutoQueueSettings(),
    getAutoQueueSettingsPosition()
  ])
  
  // TODO: There is a race condition preventing this state from being set properly on app launch :(
  // I don't know where the problem is coming from...
  setTimeout(() => {
    setGlobal({
      autoQueueSettings,
      autoQueueSettingsPosition
    })
  }, 1000)
}

export const updateAutoQueueSettings = (podcastId: string, autoQueueOn: boolean) => {
  const { autoQueueSettings } = getGlobal()
  autoQueueSettings[podcastId] = autoQueueOn
  setGlobal(
    {
      autoQueueSettings
    },
    async () => {
      const newAutoQueueSettings = await updateAutoQueueSettingsService(podcastId, autoQueueOn)
      setGlobal({ autoQueueSettings: newAutoQueueSettings })
    }
  )
}

export const updateAutoQueueSettingsPosition = (position: AutoQueueSettingsPosition) => {
  setGlobal({
    autoQueueSettingsPosition: position
  },
  async () => {
    await setAutoQueueSettingsPosition(position)
  })
}
