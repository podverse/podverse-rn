import { getGlobal, setGlobal } from 'reactn'
import {
  AutoQueueSettingsPosition,
  getAutoQueueSettings,
  getAutoQueueSettingsPosition,
  setAutoQueueSettingsPosition,
  getAutoQueueDownloadsOn,
  updateAutoQueueSettings as updateAutoQueueSettingsService,
  setAutoQueueDownloadsOn as setAutoQueueDownloadsOnService
} from '../../services/autoQueue'

/* Init both auto queue new episodes and auto queue downloads */

export const initAutoQueue = async () => {
  const [autoQueueSettings, autoQueueSettingsPosition,
    autoQueueDownloadsOn] = await Promise.all([
    getAutoQueueSettings(),
    getAutoQueueSettingsPosition(),
    getAutoQueueDownloadsOn()
  ])
  
  // TODO: There is a race condition preventing this state from being set properly on app launch :(
  // I don't know where the problem is coming from...
  setTimeout(() => {
    setGlobal({
      autoQueueSettings,
      autoQueueSettingsPosition,
      autoQueueDownloadsOn
    })
  }, 1000)
}

/* Auto queue new episdoes helpers */

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

/* Auto queue downloads helpers */

export const setAutoQueueDownloadsOn = (autoQueueDownloadsOn: boolean) => {
  setGlobal(
    {
      autoQueueDownloadsOn
    },
    async () => {
      await setAutoQueueDownloadsOnService(autoQueueDownloadsOn)
    }
  )
}
