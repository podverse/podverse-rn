import { Platform } from 'react-native'
import Config from 'react-native-config'
import * as RNIap from 'react-native-iap'

// Purchase items
const itemSkus = Platform.select({
  ios: [Config.PURCHASE_ITEM_SKU_IOS],
  android: [Config.PURCHASE_ITEM_SKU_ANDROID]
})

const _premiumMembership1Year = itemSkus[0]

export const buy1YearPremium = async () => {
  await RNIap.getProducts(itemSkus)
  await RNIap.requestPurchase(_premiumMembership1Year, false)
}
