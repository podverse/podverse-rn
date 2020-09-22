import AsyncStorage from '@react-native-community/async-storage'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'

export const initializeSettings = async () => {
  const censorNSFWText = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_TEXT)
  const offlineModeEnabled = await AsyncStorage.getItem(PV.Keys.OFFLINE_MODE_ENABLED)
  const customAPIDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
  const customWebDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)

  setGlobal({
    censorNSFWText,
    customAPIDomain,
    customWebDomain,
    offlineModeEnabled
  })
}

export const setCensorNSFWText = async (value: boolean) => {
  setGlobal({ censorNSFWText: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CENSOR_NSFW_TEXT, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CENSOR_NSFW_TEXT)
  })
}

export const setCustomAPIDomain = async (value?: string) => {
  setGlobal({ customAPIDomain: value || '' }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN, value)
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_API_DOMAIN)
  })
}

export const setCustomWebDomain = async (value?: string) => {
  setGlobal({ customWebDomain: value || '' }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN, value)
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_WEB_DOMAIN)
  })
}

export const setOfflineModeEnabled = async (value: boolean) => {
  setGlobal({ offlineModeEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.OFFLINE_MODE_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.OFFLINE_MODE_ENABLED)
  })
}
