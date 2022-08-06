import { Config } from 'react-native-config'
import * as RNKeychain from 'react-native-keychain'
import { PV } from '../../resources'
import { V4VProviderListItem } from '../../resources/V4V'
import { V4VProviderConnectedState } from '../../state/actions/v4v/v4v'

export const _v4v_env_ = !!Config.IS_DEV ? 'dev' : 'prod'

export const getV4VProviderListItems = () => {
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

export const v4vGetPluralCurrencyUnit = (unit: 'sat') => {
  let pluralUnit: 'sat' | 'sats' = unit
  if (pluralUnit === 'sat') {
    pluralUnit = 'sats'
  }

  return pluralUnit
}

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
