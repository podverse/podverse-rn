import { ValueTag, ValueTransaction, convertSecToHHMMSS } from 'podverse-shared'
import React from 'reactn'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Divider, Text, View } from '.'

export type ValueTransactionRouteError = {
  customKey?: string
  customValue?: string
  address: string
  message: string
}

type Props = {
  activeValueTag?: ValueTag
  erroringTransactions?: ValueTransactionRouteError[]
  feeTransactions: ValueTransaction[]
  isReceipt?: boolean
  nonFeeTransactions: ValueTransaction[]
  parentFeeTransactions: ValueTransaction[]
  parentNonFeeTransactions: ValueTransaction[]
  testID: string
  totalAmount?: number | string
}

export class V4VRecipientsInfoView extends React.PureComponent<Props> {
  render() {
    const { activeValueTag } = this.props

    const {
      erroringTransactions = [],
      feeTransactions = [],
      isReceipt,
      nonFeeTransactions,
      parentFeeTransactions = [],
      parentNonFeeTransactions,
      testID,
      totalAmount
    } = this.props
    const totalAmountText = isReceipt ? translate('amount paid') : translate('total amount')
    const parsedTotalAmount = typeof totalAmount === 'string' ? parseInt(totalAmount, 10) : totalAmount

    const remotePercentage = activeValueTag?.remotePercentage || 100
    const localPercentage = 100 - remotePercentage

    const combinedFeeTransactions = feeTransactions.concat(parentFeeTransactions)

    const renderTransactionSection = (data: any, index: number) => {
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
    }

    return (
      <View style={{ flex: 1 }}>
        {activeValueTag?.activeValueTimeSplit?.isActive && (
          <View style={styles.valueTimeSplitsWrapper}>
            <Text testID={`${testID}_value_time_splits_label`} style={styles.valueTimeSplitsText}>
              {/* eslint-disable-next-line max-len */}
              {`${translate('Time range')} ${convertSecToHHMMSS(
                activeValueTag.activeValueTimeSplit.startTime
              )} - ${convertSecToHHMMSS(activeValueTag.activeValueTimeSplit.endTime)}`}
            </Text>
          </View>
        )}
        <View style={styles.recipientTable}>
          {activeValueTag?.activeValueTimeSplit?.isActive && (
            <>
              <View style={styles.recipientInfoWrapper}>
                <Text testID={`${testID}_boost_recipient_remote`} style={styles.recipientSectionHeader}>
                  {translate('Remote')}
                </Text>
                <Text
                  testID={`${testID}_boost_recipient_remote_percentage`}
                  style={styles.recipientSectionHeaderNumber}>
                  {`${remotePercentage}%`}
                </Text>
              </View>
              {nonFeeTransactions?.map((data, index) => renderTransactionSection(data, index))}
              <Divider style={styles.sectionDivider} />
              <View style={styles.recipientInfoWrapper}>
                <Text testID={`${testID}_boost_recipient_local`} style={styles.recipientSectionHeader}>
                  {translate('Local')}
                </Text>
                <Text testID={`${testID}_boost_recipient_local_percentage`} style={styles.recipientSectionHeaderNumber}>
                  {`${localPercentage}%`}
                </Text>
              </View>
              {parentNonFeeTransactions?.map((data, index) => renderTransactionSection(data, index))}
              <Divider style={styles.sectionDivider} />
            </>
          )}
          {!activeValueTag?.activeValueTimeSplit?.isActive &&
            nonFeeTransactions?.map((data, index) => renderTransactionSection(data, index))}
          {combinedFeeTransactions?.length > 0 && (
            <Text testID={`${testID}_boost_fees_text`} style={styles.recipientSectionHeader}>
              {translate('Fees')}
            </Text>
          )}
          {combinedFeeTransactions?.map((data, index) => renderTransactionSection(data, index))}
          <View style={styles.recipientTableFooter}>
            <Text testID={`${testID}_boost_recipient_amount_total`} style={styles.recipientFooterText}>
              {`${totalAmountText}: ${parsedTotalAmount}`}
            </Text>
            <Text style={styles.disclaimerText} testID='boost_dropdown_banner_disclaimer_text'>
              {`(${translate('Actual amount will be higher due to network fees')})`}
            </Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  disclaimerText: {
    fontSize: PV.Fonts.sizes.sm,
    paddingTop: 2,
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
    marginBottom: 16,
    paddingTop: 8,
    paddingBottom: 4
  },
  recipientTableFooter: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderTopColor: PV.Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 4
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
  recipientSectionHeader: {
    paddingTop: 10,
    fontSize: PV.Fonts.sizes.lg,
    fontStyle: 'italic',
    flex: 1
  },
  recipientSectionHeaderNumber: {
    paddingVertical: 10,
    fontSize: PV.Fonts.sizes.lg,
    fontStyle: 'italic'
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
  },
  sectionDivider: {
    marginTop: 8
  },
  valueTimeSplitsText: {
    color: PV.Colors.greenDarker,
    fontSize: PV.Fonts.sizes.xl
  },
  valueTimeSplitsTime: {
    color: PV.Colors.greenDarker,
    fontSize: PV.Fonts.sizes.md
  },
  valueTimeSplitsWrapper: {
    marginBottom: 16,
    marginTop: -4
  }
})
