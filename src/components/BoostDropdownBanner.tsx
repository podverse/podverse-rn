import React, { useState, useGlobal } from 'reactn'
import {
  StyleSheet,
  View,
  Platform,
  UIManager,
  ScrollView
} from 'react-native'
import { ValueTransaction } from 'podverse-shared'
import { PV } from '../resources'
import { BannerInfoError } from '../resources/Interfaces'
import { DropdownBanner } from './DropDownBanner'
import { PVIcon } from './PVIcon'
import { Text, V4VRecipientsInfoView } from '.'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const BoostDropdownBanner = () => {
  const [bannerInfo] = useGlobal('bannerInfo')
  const [errors, setErrors] = useState<BannerInfoError[]>([])
  const [transactions, setTransactions] = useState<ValueTransaction[]>([])


  const erroringTransactions = errors.map((error) => {
    return { message: error.error.message, address: error.details.address }
  })

  const onExpand = () => {
    setErrors(bannerInfo.errors || [])
    setTransactions(bannerInfo.transactions || [])
  }

  const onClose = () => {
    setErrors([])
    setTransactions([])
  }

  if(bannerInfo.type !== "BOOST") {
    return null
  }

  return (
    <DropdownBanner canExpand show={bannerInfo.show} onExpand={onExpand} onClose={onClose}>
      <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}>
              <V4VRecipientsInfoView
                erroringTransactions={erroringTransactions}
                isReceipt
                testID='boost_dropdown_banner'
                totalAmount={bannerInfo.totalAmount}
                feeTransactions={[]}
                nonFeeTransactions={transactions}
                parentFeeTransactions={[]}
                parentNonFeeTransactions={[]}
              />
            
          </ScrollView>
          <View style={styles.container}>
            <Text style={styles.descriptionStyle} testID='banner_text'>
              {bannerInfo.description}
            </Text>
            {!!bannerInfo.errors?.length && (
              <PVIcon
                testID='boost_pay_banner_icon'
                name='exclamation-triangle'
                size={30}
                color={PV.Colors.redLighter}
              />
            )}
        </View>
    </DropdownBanner>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginHorizontal: 15,
    marginTop: 15
  },
  scrollViewContainer: {},
  descriptionStyle: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.extraBold
  },
  container: {
    flex: 1,
    margin: 15,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row'
  }
})
