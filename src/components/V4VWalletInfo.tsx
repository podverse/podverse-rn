import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { v4vGetPluralCurrencyUnit } from '../services/v4v/v4v'
import { V4VProviderConnectedState } from '../state/actions/v4v/v4v'
import { Text, View } from '.'

type Props = {
  navigation: any
  provider: V4VProviderConnectedState
}

export const V4VWalletInfo = (props: Props) => {
  const { provider } = props

  const balanceText = `${translate('Balance')}: ${provider.balance} ${v4vGetPluralCurrencyUnit(provider.unit)}`

  return (
    <View>
      <View style={styles.topWrapper}>
        <Text style={styles.balance}>{balanceText}</Text>
        <Text style={styles.address}>{provider.address}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  address: {
    fontSize: PV.Fonts.sizes.xxl
  },
  balance: {
    fontSize: PV.Fonts.sizes.huge,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 16
  },
  topWrapper: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 36,
    marginTop: 48
  }
})
