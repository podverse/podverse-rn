import { Platform } from 'react-native'
import * as RNIap from 'react-native-iap'

// Purchase items
const itemSkus = Platform.select({
  ios: [
    'podverse_premium_membership_1_year'
  ],
  android: [
    'podverse_premium_membership_1_year'
  ]
})

const _podversePremiumMembership1Year = itemSkus[0]

export const initProducts = async () => {
  RNIap.getProducts(itemSkus)
  const purchases = await RNIap.getAvailablePurchases()
  console.log('available purchases', purchases)
}

// const get1YearPremiumProduct = async () => {
//   const products = await RNIap.getProducts(itemSkus)
//   const item = products.find((x) => x.productId === _podversePremiumMembership1Year)
//   return item
// }

export const buy1YearPremium = async () => {
  RNIap.requestPurchase(_podversePremiumMembership1Year)
}
