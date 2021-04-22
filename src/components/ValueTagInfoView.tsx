import { ValueTransaction } from 'podverse-shared'
import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text, View } from './'

export type ValueTransactionRouteError = {
  address:string
  message:string
}

type Props = {
  testID: string
  totalAmount?: number
  transactions: ValueTransaction[]
  erroringTransactions?: ValueTransactionRouteError[]
}

export class ValueTagInfoView extends React.PureComponent<Props> {
  render() {
    const { testID, totalAmount, transactions, erroringTransactions = [] } = this.props

    return (
      <View style={styles.recipientTable}>
        <View style={styles.recipientTableHeader}>
          <Text testID={`${testID}_boost_recipient_name_title`} style={styles.recipientText}>
            {translate('Name')}
          </Text>
          <Text testID={`${testID}_boost_recipient_amount_title`} style={styles.recipientText}>
            {translate('split')} / {translate('sats')}
          </Text>
        </View>
        {transactions.map((data, index) => {
          const { name, amount, split, address } = data.normalizedValueRecipient
          const erroring = erroringTransactions.find((trs) => trs.address === address)

          return (
            <View key={`${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                testID={`${testID}_boost_recipient_name_${index}}`}
                style={[styles.recipientText, erroring ? { color: PV.Colors.redLighter } : {}]}>
                {name}
                {erroring && (
                  <Text testID={`${testID}_boost_recipient_error_${index}}`} style={styles.recipientTextError}>
                    {'\n'}
                    {erroring.message}
                  </Text>
                )}
              </Text>
              <Text
                key={`${index}`}
                testID={`${testID}_boost_recipient_amount_${index}}`}
                style={styles.recipientTextAmount}>
                {split} / {amount}
              </Text>
            </View>
          )
        })}
        <View style={styles.recipientTableFooter}>
          <Text testID={`${testID}_boost_recipient_amount_total`} style={styles.recipientFooterText}>
            {`${translate('amount paid')}: ${totalAmount}`}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  recipientFooterText: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg
  },
  recipientTable: {
    borderColor: PV.Colors.skyLight,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingBottom: 5
  },
  recipientTableFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopColor: PV.Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 5
  },
  recipientTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: PV.Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 5
  },
  recipientText: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg,
    flex: 1
  },
  recipientTextError: {
    fontSize: PV.Fonts.sizes.tiny,
    color: PV.Colors.redLighter,
    marginTop: 5
  },
  recipientTextAmount: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg
  }
})
