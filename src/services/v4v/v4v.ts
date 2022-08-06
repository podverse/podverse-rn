import { Config } from 'react-native-config'
import { PV } from '../../resources'
import { V4VProviderListItem } from '../../resources/V4V'

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
