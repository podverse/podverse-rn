import AsyncStorage from '@react-native-community/async-storage'
import Config from 'react-native-config'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'
import {
  setPlayerJumpBackwards as setPlayerJumpBackwardsService,
  setPlayerJumpForwards as setPlayerJumpForwardsService,
  updateTrackPlayerCapabilities
} from '../../services/player'
import { checkIfTrackingIsEnabled } from '../../services/tracking'
import { removeLNPayWallet } from './lnpay'

export const initializeSettings = async () => {
  const censorNSFWText = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_TEXT)
  const offlineModeEnabled = await AsyncStorage.getItem(PV.Keys.OFFLINE_MODE_ENABLED)
  const customAPIDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN)
  const customAPIDomainEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
  const customWebDomain = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN)
  const customWebDomainEnabled = await AsyncStorage.getItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)
  const errorReportingEnabled = await AsyncStorage.getItem(PV.Keys.ERROR_REPORTING_ENABLED)
  const listenTrackingEnabled = await checkIfTrackingIsEnabled()
  const urlsAPI = await PV.URLs.api()
  const urlsWeb = await PV.URLs.web()
  const jumpBackwardsTime = await AsyncStorage.getItem(PV.Keys.PLAYER_JUMP_BACKWARDS)
  const jumpForwardsTime = await AsyncStorage.getItem(PV.Keys.PLAYER_JUMP_FORWARDS)

  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) {
    try {
      await removeLNPayWallet()
    } catch (error) {
      //
    }
  }

  setGlobal({
    censorNSFWText,
    customAPIDomain: customAPIDomain ? customAPIDomain : PV.URLs.apiDefaultBaseUrl,
    customAPIDomainEnabled: customAPIDomainEnabled === 'TRUE',
    customWebDomain: customWebDomain ? customWebDomain : PV.URLs.webDefaultBaseUrl,
    customWebDomainEnabled: customWebDomainEnabled === 'TRUE',
    errorReportingEnabled,
    listenTrackingEnabled,
    offlineModeEnabled,
    jumpBackwardsTime,
    jumpForwardsTime,
    urlsAPI,
    urlsWeb
  }, () => {
    // Call updateTrackPlayerCapabilities again in case a custom jump time is available.
    updateTrackPlayerCapabilities()
  })
}

export const setCensorNSFWText = (value: boolean) => {
  setGlobal({ censorNSFWText: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CENSOR_NSFW_TEXT, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CENSOR_NSFW_TEXT)
  })
}

export const setErrorReportingEnabled = (value: boolean) => {
  setGlobal({ errorReportingEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.ERROR_REPORTING_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.ERROR_REPORTING_ENABLED)
  })
}

export const saveCustomAPIDomain = async (value?: string) => {
  // Call setItem before PV.URLs.api(), because api() reads from PV.Keys.CUSTOM_API_DOMAIN
  if (value) {
    await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN, value)
    const urlsAPI = await PV.URLs.api()
    setGlobal({ urlsAPI })
  } else {
    setGlobal({ customWebDomain: PV.URLs.apiDefaultBaseUrl }, async () => {
      await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN, PV.URLs.apiDefaultBaseUrl)
      const urlsAPI = await PV.URLs.api()
      setGlobal({ urlsAPI })
    })
  }
}

export const setCustomAPIDomainEnabled = (value?: boolean) => {
  setGlobal({ customAPIDomainEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_API_DOMAIN_ENABLED)
  })
}

export const saveCustomWebDomain = async (value?: string) => {
  // Call setItem before PV.URLs.web(), because web() reads from PV.Keys.CUSTOM_WEB_DOMAIN
  if (value) {
    await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN, value)
    const urlsWeb = await PV.URLs.web()
    setGlobal({ urlsWeb })
  } else {
    setGlobal({ customWebDomain: PV.URLs.webDefaultBaseUrl }, async () => {
      await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN, PV.URLs.webDefaultBaseUrl)
      const urlsWeb = await PV.URLs.web()
      setGlobal({ urlsWeb })
    })
  }
}

export const setCustomWebDomainEnabled = (value?: boolean) => {
  setGlobal({ customWebDomainEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.CUSTOM_WEB_DOMAIN_ENABLED)
  })
}

export const setOfflineModeEnabled = (value: boolean) => {
  setGlobal({ offlineModeEnabled: value }, async () => {
    value
      ? await AsyncStorage.setItem(PV.Keys.OFFLINE_MODE_ENABLED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.OFFLINE_MODE_ENABLED)
  })
}

export const setPlayerJumpBackwards = (val?: string) => {
  const newValue = setPlayerJumpBackwardsService(val)
  setGlobal({ jumpBackwardsTime: newValue })
}

export const setPlayerJumpForwards = (val?: string) => {
  const newValue = setPlayerJumpForwardsService(val)
  setGlobal({ jumpForwardsTime: newValue })
}
