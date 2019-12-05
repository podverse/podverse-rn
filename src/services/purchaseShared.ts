import { Platform } from 'react-native'
import * as RNIap from 'react-native-iap'

// Purchase items
const itemSkus = Platform.select({
  ios: ['podverse_premium_membership_1_year_non_renewing_subscription'],
  android: ['podverse_premium_membership_1_year']
})

const _podversePremiumMembership1Year = itemSkus[0]

export const buy1YearPremium = async () => {
  await RNIap.getProducts(itemSkus)
  await RNIap.requestPurchase(_podversePremiumMembership1Year, false)
}
