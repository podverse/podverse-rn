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
  const fiatBalanceText = provider.fiat_balance_text

  return (
    <View>
      <View style={styles.topWrapper}>
        <Text style={styles.balance}>{balanceText}</Text>
        {!!fiatBalanceText && <Text style={styles.fiatBalance}>{`${fiatBalanceText}*`}</Text>}
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
    fontWeight: PV.Fonts.weights.bold
  },
  fiatBalance: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16,
    marginTop: 4,
    fontWeight: PV.Fonts.weights.semibold
  },
  topWrapper: {
    alignItems: 'center',
    flex: 1,
    marginBottom: 36,
    marginTop: 48
  }
})
