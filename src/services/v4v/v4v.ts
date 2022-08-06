import { Config } from 'react-native-config'
import * as RNKeychain from 'react-native-keychain'
import { PV } from '../../resources'
import { V4VProviderListItem } from '../../resources/V4V'
import { V4VProviderConnectedState, V4VSettings, v4vSettingsDefault } from '../../state/actions/v4v/v4v'

/* Constants */

export const _v4v_env_ = !!Config.IS_DEV ? 'dev' : 'prod'

export const DEFAULT_BOOST_PAYMENT = 1000
export const MINIMUM_BOOST_PAYMENT = 100

export const DEFAULT_STREAMING_PAYMENT = 10
export const MINIMUM_STREAMING_PAYMENT = 1

export const DEFAULT_APP_BOOST_PAYMENT = 50
export const MINIMUM_APP_BOOST_PAYMENT = 0

export const DEFAULT_APP_STREAMING_PAYMENT = 1
export const MINIMUM_APP_STREAMING_PAYMENT = 0

/* Secure storage helpers */

export const v4vGetProvidersConnected = async () => {
  let accessData = null
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_PROVIDERS_CONNECTED)
    if (creds) {
      accessData = JSON.parse(creds.password)
    }
  } catch (error) {
    console.log('v4vGetProvidersConnected error:', error)
  }

  return accessData
}

export const v4vSetProvidersConnected = async (connected: V4VProviderConnectedState[]) => {
  try {
    await RNKeychain.setInternetCredentials(PV.Keys.V4V_PROVIDERS_CONNECTED, '', JSON.stringify(connected))
  } catch (error) {
    console.log('v4vSetProvidersEnabled error:', error)
  }
}

export const v4vGetSettings = async () => {
  let settingsData = null
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.V4V_SETTINGS)
    if (creds && creds.password) {
      settingsData = JSON.parse(creds.password)
    } else {
      settingsData = v4vSettingsDefault
      await v4vSetSettings(settingsData)
    }
  } catch (error) {
    console.log('v4vGetSettings error:', error)
  }

  return settingsData
}

export const v4vSetSettings = async (settings: V4VSettings) => {
  try {
    await RNKeychain.setInternetCredentials(PV.Keys.V4V_SETTINGS, '', JSON.stringify(settings))
  } catch (error) {
    console.log('v4vSetSettings error:', error)
  }
}

/* Misc helpers */

export const v4vGetPluralCurrencyUnit = (unit: 'sat') => {
  let pluralUnit: 'sat' | 'sats' = unit
  if (pluralUnit === 'sat') {
    pluralUnit = 'sats'
  }

  return pluralUnit
}

export const v4vGetProviderListItems = () => {
  const providerKeys = Object.keys(PV.V4V.providers)

  const providerItems = providerKeys.map((providerKey: string) => {
    const provider = PV.V4V.providers[providerKey]
    const providerItem: V4VProviderListItem = {
      title: provider.title,
      key: provider.key,
      routeName: provider.routeName
    }
    return providerItem
  })

  return providerItems
}

export const v4vGetTypeMethodKey = (type: 'lightning', method: 'keysend') => {
  let typeMethodKey = ''
  
  if (type === 'lightning' && method === 'keysend') {
    typeMethodKey = 'lightningKeysend'
  }

  return typeMethodKey
}
