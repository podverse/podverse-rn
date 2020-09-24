import AsyncStorage from '@react-native-community/async-storage'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'

export const initializeSettings = async () => {
  const censorNSFWText = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_TEXT)
  const offlineModeEnabled = await AsyncStorage.getItem(PV.Keys.OFFLINE_MODE_ENABLED)
  const customAPIDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
  const customAPIDomainEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
  const customWebDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
  const customWebDomainEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)

  setGlobal({
    censorNSFWText,
    customAPIDomain: customAPIDomain ? customAPIDomain : PV.URLs.apiDefaultBaseUrl,
    customAPIDomainEnabled,
    customWebDomain: customWebDomain ? customWebDomain : PV.URLs.webDefaultBaseUrl,
    customWebDomainEnabled,
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

export const resetCustomAPIDomain = async () => {
  setGlobal({ customAPIDomain: PV.URLs.apiDefaultBaseUrl }, async () => {
    await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN, PV.URLs.apiDefaultBaseUrl)
  })
}

export const saveCustomAPIDomain = async (value?: string) => {
  value
    ? await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN, value)
    : await AsyncStorage.removeItem(PV.Keys.CUSTOM_API_DOMAIN)
}

export const setCustomAPIDomainEnabled = async (value?: boolean) => {
  setGlobal({ customAPIDomainEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
  })
}

export const resetCustomWebDomain = async () => {
  setGlobal({ customWebDomain: PV.URLs.webDefaultBaseUrl }, async () => {
    await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN, PV.URLs.webDefaultBaseUrl)
  })
}

export const saveCustomWebDomain = async (value?: string) => {
  value
    ? await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN, value)
    : await AsyncStorage.removeItem(PV.Keys.CUSTOM_WEB_DOMAIN)
}

export const setCustomWebDomainEnabled = async (value?: boolean) => {
  setGlobal({ customWebDomainEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)
  })
}

export const setOfflineModeEnabled = async (value: boolean) => {
  setGlobal({ offlineModeEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.OFFLINE_MODE_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.OFFLINE_MODE_ENABLED)
  })
}
