import { ValueTransaction } from 'podverse-shared'
import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text, View } from '.'

export type ValueTransactionRouteError = {
  customKey?: string
  customValue?: string
  address: string
  message: string
}

type Props = {
  erroringTransactions?: ValueTransactionRouteError[]
  isReceipt?: boolean
  testID: string
  totalAmount?: number | string
  transactions: ValueTransaction[]
}

export class V4VRecipientsInfoView extends React.PureComponent<Props> {
  render() {
    const { erroringTransactions = [], isReceipt, testID, totalAmount, transactions } = this.props
    const totalAmountText = isReceipt ? translate('amount paid') : translate('total amount')
    const parsedTotalAmount = typeof totalAmount === 'string' ? parseInt(totalAmount, 10) : totalAmount

    return (
      <View style={styles.recipientTable}>
        <View style={styles.recipientTableHeader}>
          <Text testID={`${testID}_boost_recipient_name_title`} style={styles.recipientText}>
            {translate('Name')}
          </Text>
          <Text testID={`${testID}_boost_recipient_amount_title`} style={styles.recipientTextRight}>
            {translate('split')} / {translate('sats')}
          </Text>
        </View>
        {transactions.map((data, index) => {
          const { customKey, customValue, name, amount, split, address } = data.normalizedValueRecipient
          const erroring = erroringTransactions.find((trs) => {
            return (
              (customKey &&
                customValue &&
                trs.customKey === customKey &&
                trs.customValue === customValue &&
                trs.address === address) ||
              ((!customKey || !customValue) && trs.address === address)
            )
          })
          return (
            <View key={`${testID}_boost_info_${index}`}>
              <View>
                <View style={styles.recipientInfoWrapper}>
                  <Text
                    testID={`${testID}_boost_recipient_name_${index}}`}
                    style={[styles.recipientText, erroring ? { color: PV.Colors.redLighter } : {}]}>
                    {name}
                  </Text>
                  <Text
                    key={`${index}`}
                    testID={`${testID}_boost_recipient_amount_${index}}`}
                    style={styles.recipientTextAmount}>
                    {`${split}% – ${amount}`}
                  </Text>
                </View>
              </View>
              {erroring && (
                <Text testID={`${testID}_boost_recipient_error_${index}}`} style={styles.recipientTextError}>
                  {erroring.message}
                </Text>
              )}
            </View>
          )
        })}
        <View style={styles.recipientTableFooter}>
          <Text testID={`${testID}_boost_recipient_amount_total`} style={styles.recipientFooterText}>
            {`${totalAmountText}: ${parsedTotalAmount}`}
          </Text>
          <Text style={styles.disclaimerText} testID='boost_dropdown_banner_disclaimer_text'>
            {`(${translate('Actual amount will be higher due to network fees')})`}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  disclaimerText: {
    fontSize: PV.Fonts.sizes.sm,
    paddingBottom: 12,
    textAlign: 'right'
  },
  recipientErrorWrapper: {
    marginTop: 8
  },
  recipientFooterText: {
    fontSize: PV.Fonts.sizes.lg,
    paddingBottom: 6,
    paddingTop: 8
  },
  recipientInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recipientTable: {
    borderColor: PV.Colors.skyLight,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    marginBottom: 16
  },
  recipientTableFooter: {
    flexDirection: 'column',
    alignItems: 'flex-end',
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
  recipientTextRight: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg,
    flex: 1,
    textAlign: 'right'
  },
  recipientTextError: {
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.redLighter,
    flex: 0,
    marginBottom: 8
  },
  recipientTextAmount: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg
  }
})
