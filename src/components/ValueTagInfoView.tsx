import { ValueTransaction } from 'podverse-shared'
import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  testID: string
  transactions: ValueTransaction[]
}

export class ValueTagInfoView extends React.PureComponent<Props> {

  render() {
    const { testID, transactions } = this.props

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
          const { name, amount, split } = data.normalizedValueRecipient
          return (
            <View key={`${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text testID={`${testID}_boost_recipient_name_${index}}`} style={styles.recipientText}>
                {name}
              </Text>
              <Text key={`${index}`} testID={`${testID}_boost_recipient_amount_${index}}`} style={styles.recipientText}>
                {split} / {amount}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  recipientTable: {
    borderColor: PV.Colors.skyLight,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingBottom: 5
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
    fontSize: PV.Fonts.sizes.lg
  }
})
